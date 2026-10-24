import { inCidr, parseIp } from '@/lib/ip';

export type RequestContext = {
  action: string;
  resource: string;
  username: string;
  sourceIp: string;
  region: string;
  mfa: boolean;
  secureTransport: boolean;
  resourceTags: string;
};

export type StatementResult = {
  index: number;
  sid?: string;
  effect: 'Allow' | 'Deny';
  matched: boolean;
  reasons: string[];
};

export type LayerResult = {
  layer: Layer;
  error?: string;
  statements: StatementResult[];
  allow: boolean;
  deny: boolean;
};

export type Layer = 'scp' | 'boundary' | 'identity';

export type Decision = {
  allowed: boolean;
  kind: 'allow' | 'explicit-deny' | 'implicit-deny';
  summary: string;
  layers: LayerResult[];
};

export const layerNames: Record<Layer, string> = {
  scp: 'Service Control Policy',
  boundary: 'Permissions boundary',
  identity: 'Identity policy',
};

const asText = (value: unknown) => (typeof value === 'string' ? value : JSON.stringify(value));
const toList = (value: unknown): string[] => (Array.isArray(value) ? value.map(asText) : value === undefined ? [] : [asText(value)]);

// Wildcard của IAM: * là chuỗi bất kỳ, ? là đúng một ký tự.
function wildcard(pattern: string, value: string, ignoreCase: boolean) {
  const source = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${source}$`, ignoreCase ? 'i' : '').test(value);
}

function substitute(value: string, context: RequestContext) {
  return value.replace(/\$\{aws:username\}/g, context.username);
}

function contextValue(key: string, context: RequestContext): string | undefined {
  const lower = key.toLowerCase();
  if (lower === 'aws:sourceip') return context.sourceIp || undefined;
  if (lower === 'aws:username') return context.username || undefined;
  if (lower === 'aws:requestedregion') return context.region || undefined;
  if (lower === 'aws:multifactorauthpresent') return context.mfa ? 'true' : undefined;
  if (lower === 'aws:securetransport') return context.secureTransport ? 'true' : 'false';
  if (lower.startsWith('aws:resourcetag/')) {
    const tagKey = key.slice('aws:ResourceTag/'.length);
    const tags = Object.fromEntries(
      context.resourceTags
        .split(',')
        .map((pair) => pair.split('=').map((part) => part.trim()))
        .filter((pair) => pair.length === 2 && pair[0]),
    );
    return tags[tagKey];
  }
  return undefined;
}

const negated = new Set(['StringNotEquals', 'StringNotEqualsIgnoreCase', 'StringNotLike', 'NotIpAddress', 'ArnNotLike', 'ArnNotEquals']);

function compare(operator: string, expected: string, actual: string) {
  switch (operator) {
    case 'StringEquals':
    case 'StringNotEquals':
    case 'ArnEquals':
    case 'ArnNotEquals':
      return expected === actual;
    case 'StringEqualsIgnoreCase':
    case 'StringNotEqualsIgnoreCase':
      return expected.toLowerCase() === actual.toLowerCase();
    case 'StringLike':
    case 'StringNotLike':
    case 'ArnLike':
    case 'ArnNotLike':
      return wildcard(expected, actual, false);
    case 'Bool':
      return expected.toLowerCase() === actual.toLowerCase();
    case 'IpAddress':
    case 'NotIpAddress': {
      const ip = parseIp(actual);
      return ip !== null && inCidr(ip, expected.includes('/') ? expected : `${expected}/32`);
    }
    default:
      return null;
  }
}

function evaluateCondition(condition: unknown, context: RequestContext): string[] {
  if (condition === undefined) return [];
  if (typeof condition !== 'object' || condition === null) return ['Condition phải là một object.'];
  const failures: string[] = [];

  for (const [rawOperator, block] of Object.entries(condition)) {
    const ifExists = rawOperator.endsWith('IfExists');
    const operator = ifExists ? rawOperator.slice(0, -'IfExists'.length) : rawOperator;
    for (const [key, expectedRaw] of Object.entries((block ?? {}) as Record<string, unknown>)) {
      const expected = toList(expectedRaw).map((value) => substitute(value, context));
      const actual = contextValue(key, context);
      const shown = `${rawOperator} ${key}`;

      if (actual === undefined) {
        // Khóa vắng mặt: toán tử phủ định và …IfExists coi là khớp, các toán tử còn lại là không khớp.
        if (!ifExists && !negated.has(operator)) failures.push(`${shown}: request không có khóa ${key}.`);
        continue;
      }

      const results = expected.map((value) => compare(operator, value, actual));
      if (results.some((result) => result === null)) {
        failures.push(`${shown}: toán tử ${operator} chưa được mô phỏng.`);
        continue;
      }
      const anyMatch = results.some(Boolean);
      const passes = negated.has(operator) ? !anyMatch : anyMatch;
      if (!passes) failures.push(`${shown}: giá trị “${actual}” ${negated.has(operator) ? 'lại khớp' : 'không khớp'} [${expected.join(', ')}].`);
    }
  }
  return failures;
}

function evaluateLayer(layer: Layer, text: string, context: RequestContext): LayerResult {
  let document: { Statement?: unknown };
  try {
    document = JSON.parse(text);
  } catch (error) {
    return { layer, error: `JSON không hợp lệ: ${(error as Error).message}`, statements: [], allow: false, deny: false };
  }
  const statements = Array.isArray(document.Statement) ? document.Statement : document.Statement ? [document.Statement] : [];
  if (statements.length === 0) return { layer, error: 'Policy không có Statement nào.', statements: [], allow: false, deny: false };

  const results = (statements as Record<string, unknown>[]).map((statement, index): StatementResult => {
    const effect = statement.Effect === 'Deny' ? 'Deny' : 'Allow';
    const reasons: string[] = [];
    if (statement.Effect !== 'Allow' && statement.Effect !== 'Deny') reasons.push('Effect phải là "Allow" hoặc "Deny".');

    const actions = toList(statement.Action);
    const notActions = toList(statement.NotAction);
    if (actions.length) {
      if (!actions.some((action) => wildcard(action, context.action, true))) reasons.push(`Action [${actions.join(', ')}] không khớp ${context.action}.`);
    } else if (notActions.length) {
      if (notActions.some((action) => wildcard(action, context.action, true))) reasons.push(`${context.action} nằm trong NotAction nên statement không áp dụng.`);
    } else reasons.push('Thiếu Action hoặc NotAction.');

    const resources = toList(statement.Resource).map((value) => substitute(value, context));
    const notResources = toList(statement.NotResource).map((value) => substitute(value, context));
    if (resources.length) {
      if (!resources.some((resource) => wildcard(resource, context.resource, false))) reasons.push(`Resource [${resources.join(', ')}] không khớp ${context.resource}.`);
    } else if (notResources.length) {
      if (notResources.some((resource) => wildcard(resource, context.resource, false))) reasons.push('Resource nằm trong NotResource nên statement không áp dụng.');
    } else reasons.push('Thiếu Resource hoặc NotResource.');

    reasons.push(...evaluateCondition(statement.Condition, context));
    return { index, sid: typeof statement.Sid === 'string' ? statement.Sid : undefined, effect, matched: reasons.length === 0, reasons };
  });

  return {
    layer,
    statements: results,
    allow: results.some((result) => result.matched && result.effect === 'Allow'),
    deny: results.some((result) => result.matched && result.effect === 'Deny'),
  };
}

export function evaluateRequest(policies: Partial<Record<Layer, string>>, context: RequestContext): Decision {
  const layers = (['scp', 'boundary', 'identity'] as Layer[])
    .filter((layer) => policies[layer] !== undefined)
    .map((layer) => evaluateLayer(layer, policies[layer]!, context));

  const broken = layers.find((layer) => layer.error);
  if (broken) return { allowed: false, kind: 'implicit-deny', summary: `${layerNames[broken.layer]} lỗi: ${broken.error}`, layers };

  const denying = layers.find((layer) => layer.deny);
  if (denying) return { allowed: false, kind: 'explicit-deny', summary: `${layerNames[denying.layer]} có Deny tường minh khớp request. Deny luôn thắng mọi Allow.`, layers };

  const missing = layers.find((layer) => !layer.allow);
  if (missing) {
    const why =
      missing.layer === 'identity'
        ? 'Không statement nào của identity policy cho phép: mặc định là chặn.'
        : `${layerNames[missing.layer]} không cho phép hành động này. Lớp này là “trần quyền”: identity policy có Allow cũng không vượt qua được.`;
    return { allowed: false, kind: 'implicit-deny', summary: why, layers };
  }

  return { allowed: true, kind: 'allow', summary: layers.length > 1 ? 'Mọi lớp đều có Allow khớp và không lớp nào có Deny.' : 'Có Allow khớp và không có Deny nào.', layers };
}
