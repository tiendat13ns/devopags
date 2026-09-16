'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, SyntheticEvent } from 'react';
import { CornerDownLeft, GitBranch, RotateCcw, Sparkles, Terminal, Trash2 } from 'lucide-react';

type FileNode =
  | { type: 'file'; content: string }
  | { type: 'directory'; children: Record<string, FileNode> };

type DirectoryNode = Extract<FileNode, { type: 'directory' }>;

type TerminalLine =
  | { kind: 'command'; command: string; path: string }
  | { kind: 'output' | 'error' | 'success' | 'system'; text: string };

type CommandResult = {
  fileSystem?: DirectoryNode;
  cwd?: string;
  lines?: TerminalLine[];
  clear?: boolean;
  reset?: boolean;
};

const USER_HOME = '/home/devopags';

const SUPPORTED_COMMANDS = [
  'pwd',
  'whoami',
  'cd',
  'ls',
  'mkdir',
  'touch',
  'rm',
  'cp',
  'mv',
  'echo',
  'cat',
  'history',
  'tail',
  'sudo',
  'free',
  'df',
  'top',
  'hostnamectl',
  'reboot',
  'netstat',
  'ps',
  'ping',
  'telnet',
  'traceroute',
  'apt',
  'help',
  'clear',
  'reset',
];

const INITIAL_LINES: TerminalLine[] = [
  { kind: 'system', text: 'DevOpags Linux Playground · môi trường mô phỏng an toàn' },
  { kind: 'system', text: 'Gõ “help” để xem lệnh hỗ trợ hoặc bắt đầu với “pwd”.' },
];

function createInitialFileSystem(): DirectoryNode {
  return {
    type: 'directory',
    children: {
      home: {
        type: 'directory',
        children: {
          devopags: {
            type: 'directory',
            children: {
              'README.md': {
                type: 'file',
                content: '# Linux Playground\n\nHãy thử pwd, ls -lah, mkdir và touch.',
              },
              projects: {
                type: 'directory',
                children: {
                  demo: {
                    type: 'directory',
                    children: {
                      'app.conf': { type: 'file', content: 'PORT=8080\nENV=development' },
                    },
                  },
                },
              },
              logs: {
                type: 'directory',
                children: {
                  'app.log': {
                    type: 'file',
                    content: '[09:00:01] server started on :8080\n[09:02:14] GET /health 200\n[09:05:42] deploy completed',
                  },
                },
              },
              '.env.example': { type: 'file', content: 'APP_PORT=8080\nAPP_ENV=development' },
            },
          },
        },
      },
      etc: {
        type: 'directory',
        children: {
          'os-release': {
            type: 'file',
            content: 'NAME="Ubuntu"\nVERSION="24.04 LTS"\nID=ubuntu',
          },
          hostname: { type: 'file', content: 'devopags-lab' },
        },
      },
      var: {
        type: 'directory',
        children: {
          log: {
            type: 'directory',
            children: {
              'syslog': { type: 'file', content: 'systemd: Started DevOpags playground\nnetwork: eth0 is up' },
            },
          },
        },
      },
      tmp: { type: 'directory', children: {} },
    },
  };
}

function cloneFileSystem(fileSystem: DirectoryNode): DirectoryNode {
  return JSON.parse(JSON.stringify(fileSystem)) as DirectoryNode;
}

function normalizePath(input: string | undefined, cwd: string) {
  if (!input || input === '~') return USER_HOME;
  const expanded = input.startsWith('~/') ? `${USER_HOME}/${input.slice(2)}` : input;
  const source = expanded.startsWith('/') ? expanded : `${cwd}/${expanded}`;
  const segments: string[] = [];

  for (const part of source.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') segments.pop();
    else segments.push(part);
  }

  return `/${segments.join('/')}`;
}

function getNode(fileSystem: DirectoryNode, path: string): FileNode | undefined {
  if (path === '/') return fileSystem;
  let current: FileNode = fileSystem;

  for (const segment of path.split('/').filter(Boolean)) {
    if (current.type !== 'directory') return undefined;
    current = current.children[segment];
    if (!current) return undefined;
  }

  return current;
}

function getParent(fileSystem: DirectoryNode, path: string) {
  const segments = path.split('/').filter(Boolean);
  const name = segments.pop();
  const parentPath = segments.length ? `/${segments.join('/')}` : '/';
  const parent = getNode(fileSystem, parentPath);
  return { name, parent: parent?.type === 'directory' ? parent : undefined };
}

function formatPromptPath(path: string) {
  return path.startsWith(USER_HOME) ? path.replace(USER_HOME, '~') || '~' : path;
}

function tokenize(value: string) {
  const tokens: string[] = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value))) tokens.push(match[1] ?? match[2] ?? match[3]);
  return tokens;
}

function output(text: string, kind: Extract<TerminalLine['kind'], 'output' | 'error' | 'success' | 'system'> = 'output'): TerminalLine[] {
  return [{ kind, text }];
}

function executeCommand(
  rawCommand: string,
  fileSystem: DirectoryNode,
  cwd: string,
  history: string[],
  depth = 0,
): CommandResult {
  const tokens = tokenize(rawCommand.trim());
  const command = tokens[0]?.toLowerCase();
  const args = tokens.slice(1);

  if (!command) return {};
  if (depth > 2) return { lines: output('sudo: không thể lồng lệnh quá sâu', 'error') };

  if (command === 'help') {
    return {
      lines: output(
        'LỆNH HỖ TRỢ\n\npwd  whoami  cd  ls  mkdir  touch  rm  cp  mv\necho  cat  history  tail  sudo  free  df  top\nhostnamectl  reboot  netstat  ps  ping  telnet\ntraceroute  apt\n\nTIỆN ÍCH PLAYGROUND\nhelp  clear  reset',
        'system',
      ),
    };
  }

  if (command === 'clear') return { clear: true };
  if (command === 'reset') return { reset: true };
  if (command === 'pwd') return { lines: output(cwd) };
  if (command === 'whoami') return { lines: output('devopags') };

  if (command === 'cd') {
    const nextPath = normalizePath(args[0], cwd);
    const node = getNode(fileSystem, nextPath);
    if (!node) return { lines: output(`cd: không tìm thấy: ${args[0] ?? '~'}`, 'error') };
    if (node.type !== 'directory') return { lines: output(`cd: không phải thư mục: ${args[0]}`, 'error') };
    return { cwd: nextPath };
  }

  if (command === 'ls') {
    const showHidden = args.some((arg) => arg.includes('a'));
    const longFormat = args.some((arg) => arg.includes('l'));
    const requestedPath = args.find((arg) => !arg.startsWith('-'));
    const targetPath = normalizePath(requestedPath ?? '.', cwd);
    const node = getNode(fileSystem, targetPath);
    if (!node) return { lines: output(`ls: không tìm thấy: ${requestedPath ?? targetPath}`, 'error') };
    if (node.type === 'file') return { lines: output(requestedPath ?? targetPath) };

    const entries = Object.entries(node.children)
      .filter(([name]) => showHidden || !name.startsWith('.'))
      .sort(([a], [b]) => a.localeCompare(b));
    if (!entries.length) return { lines: output('(thư mục trống)', 'system') };

    const text = longFormat
      ? entries
          .map(([name, child]) => `${child.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--'}  devopags  ${child.type === 'directory' ? '4.0K' : '128B'}  ${name}${child.type === 'directory' ? '/' : ''}`)
          .join('\n')
      : entries.map(([name, child]) => `${name}${child.type === 'directory' ? '/' : ''}`).join('  ');
    return { lines: output(text) };
  }

  if (command === 'mkdir') {
    const recursive = args.includes('-p');
    const requestedPath = args.find((arg) => !arg.startsWith('-'));
    if (!requestedPath) return { lines: output('mkdir: thiếu tên thư mục', 'error') };
    const targetPath = normalizePath(requestedPath, cwd);
    const nextFileSystem = cloneFileSystem(fileSystem);
    const segments = targetPath.split('/').filter(Boolean);
    let current: DirectoryNode = nextFileSystem;

    for (const [index, segment] of segments.entries()) {
      const existing = current.children[segment];
      const isLast = index === segments.length - 1;
      if (!existing) {
        if (!recursive && !isLast) return { lines: output(`mkdir: thư mục cha không tồn tại: ${segment}`, 'error') };
        current.children[segment] = { type: 'directory', children: {} };
      } else if (existing.type !== 'directory') {
        return { lines: output(`mkdir: ${segment} không phải thư mục`, 'error') };
      } else if (isLast) {
        return { lines: output(`mkdir: thư mục đã tồn tại: ${requestedPath}`, 'error') };
      }
      current = current.children[segment] as DirectoryNode;
    }
    return { fileSystem: nextFileSystem, lines: output(`Đã tạo ${targetPath}`, 'success') };
  }

  if (command === 'touch') {
    const requestedPath = args[0];
    if (!requestedPath) return { lines: output('touch: thiếu tên file', 'error') };
    const targetPath = normalizePath(requestedPath, cwd);
    const nextFileSystem = cloneFileSystem(fileSystem);
    const { name, parent } = getParent(nextFileSystem, targetPath);
    if (!name || !parent) return { lines: output(`touch: thư mục cha không tồn tại: ${requestedPath}`, 'error') };
    if (parent.children[name]?.type === 'directory') return { lines: output(`touch: ${requestedPath} là thư mục`, 'error') };
    parent.children[name] = parent.children[name] ?? { type: 'file', content: '' };
    return { fileSystem: nextFileSystem, lines: output(`Đã tạo ${targetPath}`, 'success') };
  }

  if (command === 'rm') {
    const recursive = args.some((arg) => arg === '-r' || arg === '-rf' || arg === '-fr');
    const requestedPath = args.find((arg) => !arg.startsWith('-'));
    if (!requestedPath) return { lines: output('rm: thiếu file hoặc thư mục', 'error') };
    const targetPath = normalizePath(requestedPath, cwd);
    if (targetPath === '/' || targetPath === USER_HOME) return { lines: output('rm: playground chặn thao tác xóa vị trí quan trọng', 'error') };
    const nextFileSystem = cloneFileSystem(fileSystem);
    const { name, parent } = getParent(nextFileSystem, targetPath);
    const target = name && parent?.children[name];
    if (!name || !parent || !target) return { lines: output(`rm: không tìm thấy: ${requestedPath}`, 'error') };
    if (target.type === 'directory' && !recursive) return { lines: output(`rm: ${requestedPath} là thư mục; thêm -r để xóa`, 'error') };
    delete parent.children[name];
    return { fileSystem: nextFileSystem, lines: output(`Đã xóa ${targetPath} trong filesystem ảo`, 'success') };
  }

  if (command === 'cp' || command === 'mv') {
    const paths = args.filter((arg) => !arg.startsWith('-'));
    if (paths.length < 2) return { lines: output(`${command}: cần đường dẫn nguồn và đích`, 'error') };
    const sourcePath = normalizePath(paths[0], cwd);
    const destinationPath = normalizePath(paths[1], cwd);
    const source = getNode(fileSystem, sourcePath);
    if (!source) return { lines: output(`${command}: không tìm thấy nguồn: ${paths[0]}`, 'error') };
    if (source.type === 'directory' && command === 'cp' && !args.includes('-r')) {
      return { lines: output('cp: thư mục cần tùy chọn -r', 'error') };
    }

    const nextFileSystem = cloneFileSystem(fileSystem);
    const clonedSource = JSON.parse(JSON.stringify(source)) as FileNode;
    const existingDestination = getNode(nextFileSystem, destinationPath);
    let finalPath = destinationPath;
    if (existingDestination?.type === 'directory') {
      const sourceName = sourcePath.split('/').filter(Boolean).at(-1) ?? 'item';
      finalPath = `${destinationPath === '/' ? '' : destinationPath}/${sourceName}`;
    }
    const destination = getParent(nextFileSystem, finalPath);
    if (!destination.name || !destination.parent) return { lines: output(`${command}: thư mục đích không tồn tại`, 'error') };
    destination.parent.children[destination.name] = clonedSource;

    if (command === 'mv') {
      const sourceParent = getParent(nextFileSystem, sourcePath);
      if (sourceParent.name && sourceParent.parent) delete sourceParent.parent.children[sourceParent.name];
    }
    return { fileSystem: nextFileSystem, lines: output(`${command === 'cp' ? 'Đã sao chép' : 'Đã di chuyển'} tới ${finalPath}`, 'success') };
  }

  if (command === 'echo') return { lines: output(args.join(' ')) };

  if (command === 'cat' || command === 'tail') {
    const requestedPath = args.filter((arg) => !arg.startsWith('-')).at(-1);
    if (!requestedPath) return { lines: output(`${command}: thiếu tên file`, 'error') };
    const target = getNode(fileSystem, normalizePath(requestedPath, cwd));
    if (!target) return { lines: output(`${command}: không tìm thấy: ${requestedPath}`, 'error') };
    if (target.type !== 'file') return { lines: output(`${command}: ${requestedPath} là thư mục`, 'error') };
    const lines = target.content.split('\n');
    const text = command === 'tail' ? lines.slice(-10).join('\n') : target.content;
    const followNote = command === 'tail' && args.includes('-f') ? '\n\n[đang mô phỏng theo dõi log · nhấn Enter để tiếp tục]' : '';
    return { lines: output(`${text || '(file rỗng)'}${followNote}`) };
  }

  if (command === 'history') {
    return { lines: output(history.map((item, index) => `${String(index + 1).padStart(3, ' ')}  ${item}`).join('\n')) };
  }

  if (command === 'sudo') {
    if (!args.length) return { lines: output('sudo: hãy nhập lệnh cần chạy', 'error') };
    return executeCommand(args.join(' '), fileSystem, cwd, history, depth + 1);
  }

  if (command === 'free') {
    return { lines: output('               total        used        free      shared  buff/cache   available\nMem:           7.8Gi       2.1Gi       3.9Gi       128Mi       1.8Gi       5.2Gi\nSwap:          2.0Gi          0B       2.0Gi') };
  }

  if (command === 'df') {
    return { lines: output('Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        40G   12G   26G  32% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm') };
  }

  if (command === 'top') {
    return { lines: output('top - 09:42:16 up 12 days,  2 users,  load average: 0.18, 0.14, 0.09\nTasks: 124 total,   1 running, 123 sleeping\n%Cpu(s):  2.1 us,  0.8 sy, 97.1 id\nMiB Mem :  7982.0 total,  2148.0 used,  3994.0 free\n\n  PID USER       %CPU  %MEM COMMAND\n 1842 devopags    1.2   2.8 node\n  721 root        0.3   1.1 dockerd') };
  }

  if (command === 'hostnamectl') {
    return { lines: output(' Static hostname: devopags-lab\n       Icon name: computer-vm\n         Chassis: vm\nOperating System: Ubuntu 24.04 LTS\n          Kernel: Linux 6.8.0\n    Architecture: x86-64') };
  }

  if (command === 'reboot') {
    return { lines: output('Mô phỏng: hệ thống sẽ khởi động lại. Không có máy thật nào bị tác động.', 'system') };
  }

  if (command === 'netstat') {
    return { lines: output('Proto Recv-Q Send-Q Local Address       Foreign Address     State       PID/Program name\ntcp        0      0 0.0.0.0:22          0.0.0.0:*           LISTEN      642/sshd\ntcp        0      0 0.0.0.0:8080        0.0.0.0:*           LISTEN      1842/node') };
  }

  if (command === 'ps') {
    return { lines: output('USER         PID %CPU %MEM COMMAND\nroot           1  0.0  0.2 /sbin/init\nroot         642  0.0  0.4 /usr/sbin/sshd\ndevopags    1842  1.2  2.8 node server.js') };
  }

  if (command === 'ping') {
    const host = args.find((arg, index) => !arg.startsWith('-') && args[index - 1] !== '-c') ?? '8.8.8.8';
    return { lines: output(`PING ${host} (${host}) 56(84) bytes of data.\n64 bytes from ${host}: icmp_seq=1 ttl=117 time=18.4 ms\n64 bytes from ${host}: icmp_seq=2 ttl=117 time=17.9 ms\n64 bytes from ${host}: icmp_seq=3 ttl=117 time=18.1 ms\n64 bytes from ${host}: icmp_seq=4 ttl=117 time=18.0 ms\n\n--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`) };
  }

  if (command === 'telnet') {
    const host = args[0];
    const port = args[1];
    if (!host || !port) return { lines: output('Cách dùng: telnet <host> <port>', 'error') };
    return { lines: output(`Trying ${host}...\nConnected to ${host}:${port}.\nEscape character is '^]'.`, 'success') };
  }

  if (command === 'traceroute') {
    const host = args[0] ?? '8.8.8.8';
    return { lines: output(`traceroute to ${host}, 30 hops max\n 1  gateway (10.0.0.1)       1.142 ms\n 2  isp-router (100.64.0.1)  7.824 ms\n 3  ${host}                  18.306 ms`) };
  }

  if (command === 'apt') {
    const action = args[0];
    if (action === 'update') return { lines: output('Đã mô phỏng cập nhật danh sách package. All packages are up to date.', 'success') };
    if (action === 'install' && args[1]) return { lines: output(`Đã mô phỏng cài đặt ${args[1]} thành công.`, 'success') };
    if (action === 'remove' && args[1]) return { lines: output(`Đã mô phỏng gỡ ${args[1]} thành công.`, 'success') };
    return { lines: output('Cách dùng: apt update | apt install <package> | apt remove <package>', 'error') };
  }

  return { lines: output(`${command}: command not found. Gõ “help” để xem các lệnh được hỗ trợ.`, 'error') };
}

const SUGGESTIONS = [
  { label: 'Xem vị trí hiện tại', command: 'pwd' },
  { label: 'Liệt kê cả file ẩn', command: 'ls -lah' },
  { label: 'Đọc file giới thiệu', command: 'cat README.md' },
  { label: 'Theo dõi log ứng dụng', command: 'tail -f logs/app.log' },
  { label: 'Kiểm tra RAM', command: 'free -h' },
  { label: 'Kiểm tra các port', command: 'sudo netstat -tulpn' },
];

export function DevOpsPlayground() {
  const [mode, setMode] = useState<'linux' | 'git'>('linux');

  return (
    <div>
      <div className="mb-5 inline-flex rounded-xl border border-border bg-card/80 p-1 shadow-sm" role="tablist" aria-label="Chọn môi trường thực hành">
        <button
          id="linux-playground-tab"
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${mode === 'linux' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-ink'}`}
          type="button"
          role="tab"
          aria-selected={mode === 'linux'}
          aria-controls="linux-playground-panel"
          onClick={() => setMode('linux')}
        >
          <Terminal size={16} /> Linux
        </button>
        <button
          id="git-playground-tab"
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${mode === 'git' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-ink'}`}
          type="button"
          role="tab"
          aria-selected={mode === 'git'}
          aria-controls="git-playground-panel"
          onClick={() => setMode('git')}
        >
          <GitBranch size={16} /> Git
        </button>
      </div>

      <div id={`${mode}-playground-panel`} role="tabpanel" aria-labelledby={`${mode}-playground-tab`}>
        {mode === 'linux' ? <LinuxTerminal /> : <GitPlayground />}
      </div>
    </div>
  );
}

export const LinuxPlayground = DevOpsPlayground;

function LinuxTerminal() {
  const [fileSystem, setFileSystem] = useState<DirectoryNode>(() => createInitialFileSystem());
  const [cwd, setCwd] = useState(USER_HOME);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  function resetPlayground() {
    setFileSystem(createInitialFileSystem());
    setCwd(USER_HOME);
    setHistory([]);
    setHistoryIndex(0);
    setInput('');
    setLines([
      { kind: 'system', text: 'Playground đã được khôi phục về trạng thái ban đầu.' },
      { kind: 'system', text: 'Gõ “help” để xem danh sách lệnh.' },
    ]);
    inputRef.current?.focus();
  }

  function submitCommand(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;

    const nextHistory = [...history, command];
    const result = executeCommand(command, fileSystem, cwd, nextHistory);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length);
    setInput('');

    if (result.reset) {
      resetPlayground();
      return;
    }

    if (result.clear) {
      setLines([]);
      return;
    }

    if (result.fileSystem) setFileSystem(result.fileSystem);
    if (result.cwd) setCwd(result.cwd);
    setLines((current) => [
      ...current,
      { kind: 'command', command, path: formatPromptPath(cwd) },
      ...(result.lines ?? []),
    ]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!history.length) return;
      const nextIndex = Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? '');
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = Math.min(history.length, historyIndex + 1);
      setHistoryIndex(nextIndex);
      setInput(nextIndex === history.length ? '' : history[nextIndex] ?? '');
    }

    if (event.key === 'Tab' && !input.includes(' ')) {
      event.preventDefault();
      const matches = SUPPORTED_COMMANDS.filter((command) => command.startsWith(input.toLowerCase()));
      if (matches.length === 1) setInput(matches[0]);
    }
  }

  function selectSuggestion(command: string) {
    setInput(command);
    inputRef.current?.focus();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section
        className="overflow-hidden rounded-2xl border border-[#6f32a8] bg-[#100b18] shadow-[0_28px_80px_-40px_rgba(111,50,168,0.9)]"
        aria-label="Linux terminal mô phỏng"
      >
        <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#1a1026] px-4">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#5a189a] shadow-[0_0_10px_rgba(90,24,154,0.8)]" />
            <span className="size-3 rounded-full bg-[#9d4edd] shadow-[0_0_10px_rgba(157,78,221,0.8)]" />
            <span className="size-3 rounded-full bg-[#c77dff] shadow-[0_0_10px_rgba(199,125,255,0.8)]" />
          </div>
          <span className="font-mono text-xs font-semibold text-white/55">devopags — bash</span>
          <div className="flex items-center gap-1">
            <button
              className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-[#dfa8ff]"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setLines([]);
              }}
              aria-label="Xóa nội dung terminal"
              title="Xóa terminal"
            >
              <Trash2 size={15} />
            </button>
            <button
              className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-[#dfa8ff]"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                resetPlayground();
              }}
              aria-label="Khôi phục playground"
              title="Khôi phục"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        <div
          ref={outputRef}
          className="h-[430px] overflow-y-auto px-4 py-5 font-mono text-[13px] leading-6 sm:px-5 sm:text-sm"
          aria-live="polite"
        >
          {lines.map((line, index) =>
            line.kind === 'command' ? (
              <div className="break-words" key={`${line.command}-${index}`}>
                <span className="font-semibold text-[#c77dff]">devopags@lab</span>
                <span className="font-semibold text-[#67d9ff]">:{line.path}</span>
                <span className="text-white">$ {line.command}</span>
              </div>
            ) : (
              <pre
                className={`whitespace-pre-wrap break-words font-mono ${
                  line.kind === 'error'
                    ? 'text-[#ff6b81]'
                    : line.kind === 'success'
                      ? 'text-[#63d7a4]'
                      : line.kind === 'system'
                        ? 'text-[#ffd166]'
                        : 'text-[#c9c1d4]'
                }`}
                key={`${line.text}-${index}`}
              >
                {line.text}
              </pre>
            ),
          )}

          <form className="mt-1 flex min-w-0 items-center" onSubmit={submitCommand}>
            <label className="sr-only" htmlFor="linux-command">Nhập lệnh Linux</label>
            <span className="shrink-0 font-semibold text-[#c77dff]">devopags@lab</span>
            <span className="shrink-0 font-semibold text-[#67d9ff]">:{formatPromptPath(cwd)}</span>
            <span className="shrink-0 text-white">$&nbsp;</span>
            <input
              ref={inputRef}
              id="linux-command"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-white caret-[#dfa8ff] outline-none placeholder:text-white/25"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="nhập lệnh..."
            />
            <button className="ml-2 grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/55 transition hover:border-[#9d4edd] hover:text-[#dfa8ff]" type="submit" aria-label="Chạy lệnh">
              <CornerDownLeft size={15} />
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#160d20] px-4 py-2.5 font-mono text-[11px] text-white/35 sm:px-5">
          <span>↑ ↓ lịch sử · Tab hoàn thành lệnh</span>
          <span>Mọi thao tác chỉ diễn ra trong trình duyệt</span>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={17} />
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Thử nhanh</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Chọn một gợi ý để đưa lệnh vào terminal, sau đó nhấn Enter.</p>
          <div className="mt-4 space-y-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition hover:border-primary/45 hover:bg-accent"
                type="button"
                key={suggestion.command}
                onClick={() => selectSuggestion(suggestion.command)}
              >
                <span className="block text-sm font-semibold text-ink">{suggestion.label}</span>
                <code className="mt-1 block text-xs text-primary">$ {suggestion.command}</code>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">Ghi nhớ</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Đây là terminal mô phỏng. Bạn có thể thử <code className="inline-code">rm</code>, <code className="inline-code">sudo</code> và <code className="inline-code">reboot</code> mà không tác động tới máy thật.
          </p>
        </section>
      </aside>
    </div>
  );
}

type GitFileState = 'clean' | 'modified' | 'untracked' | 'staged';

type GitRepository = {
  initialized: boolean;
  branch: string;
  branches: string[];
  files: Record<string, GitFileState>;
  commits: { hash: string; message: string }[];
  stashCount: number;
  remote: boolean;
};

type GitCommandResult = {
  repository?: GitRepository;
  lines?: TerminalLine[];
  clear?: boolean;
  reset?: boolean;
};

const GIT_SUBCOMMANDS = [
  'init',
  'clone',
  'status',
  'diff',
  'add',
  'commit',
  'log',
  'branch',
  'switch',
  'merge',
  'restore',
  'stash',
  'remote',
  'fetch',
  'pull',
  'push',
];

const GIT_SUGGESTIONS = [
  { label: 'Kiểm tra trạng thái repo', command: 'git status' },
  { label: 'Xem nội dung đã thay đổi', command: 'git diff' },
  { label: 'Đưa mọi thay đổi vào staging', command: 'git add .' },
  { label: 'Tạo một commit', command: 'git commit -m "docs: update README"' },
  { label: 'Xem lịch sử gọn', command: 'git log --oneline --graph' },
  { label: 'Tạo branch mới', command: 'git switch -c feature/playground' },
];

function createInitialGitRepository(): GitRepository {
  return {
    initialized: true,
    branch: 'main',
    branches: ['main'],
    files: {
      'README.md': 'clean',
      'app.js': 'modified',
      'deploy.sh': 'untracked',
    },
    commits: [
      { hash: '9d21f6a', message: 'docs: add project notes' },
      { hash: '4b17c0e', message: 'chore: initialize project' },
    ],
    stashCount: 0,
    remote: true,
  };
}

function cloneRepository(repository: GitRepository): GitRepository {
  return JSON.parse(JSON.stringify(repository)) as GitRepository;
}

function gitStatus(repository: GitRepository) {
  const staged = Object.entries(repository.files).filter(([, state]) => state === 'staged');
  const modified = Object.entries(repository.files).filter(([, state]) => state === 'modified');
  const untracked = Object.entries(repository.files).filter(([, state]) => state === 'untracked');
  const sections = [`On branch ${repository.branch}`];

  if (!staged.length && !modified.length && !untracked.length) {
    sections.push('nothing to commit, working tree clean');
    return sections.join('\n');
  }

  if (staged.length) {
    sections.push(`Changes to be committed:\n${staged.map(([file]) => `  modified:   ${file}`).join('\n')}`);
  }
  if (modified.length) {
    sections.push(`Changes not staged for commit:\n${modified.map(([file]) => `  modified:   ${file}`).join('\n')}`);
  }
  if (untracked.length) {
    sections.push(`Untracked files:\n${untracked.map(([file]) => `  ${file}`).join('\n')}`);
  }
  return sections.join('\n\n');
}

function executeGitCommand(rawCommand: string, repository: GitRepository): GitCommandResult {
  const tokens = tokenize(rawCommand.trim());
  const command = tokens[0]?.toLowerCase();

  if (!command) return {};
  if (command === 'clear') return { clear: true };
  if (command === 'reset') return { reset: true };
  if (command === 'help') {
    return {
      lines: output(
        'GIT COMMANDS\n\ngit init       git clone      git status\ngit diff       git add        git commit\ngit log        git branch     git switch\ngit merge      git restore    git stash\ngit remote     git fetch      git pull\ngit push\n\nTIỆN ÍCH PLAYGROUND\nhelp  clear  reset',
        'system',
      ),
    };
  }

  if (command !== 'git') {
    return { lines: output('Git mode chỉ nhận lệnh bắt đầu bằng “git”. Gõ “help” để xem gợi ý.', 'error') };
  }

  const action = tokens[1]?.toLowerCase();
  const args = tokens.slice(2);
  if (!action) return { lines: output('Cách dùng: git <command> [options]', 'error') };

  if (action === 'init') {
    const next = createInitialGitRepository();
    next.commits = [];
    next.remote = false;
    next.files = { 'README.md': 'untracked', 'app.js': 'untracked', 'deploy.sh': 'untracked' };
    return { repository: next, lines: output('Initialized empty Git repository in /home/devopags/project/.git/', 'success') };
  }

  if (action === 'clone') {
    if (!args[0]) return { lines: output('Cách dùng: git clone <repository-url>', 'error') };
    const next = createInitialGitRepository();
    next.files = { 'README.md': 'clean', 'app.js': 'clean', 'deploy.sh': 'clean' };
    return { repository: next, lines: output(`Cloning into 'project'...\nremote: repository mô phỏng\nReceiving objects: 100%\nDone.`, 'success') };
  }

  if (!repository.initialized) return { lines: output('fatal: not a git repository', 'error') };

  if (action === 'status') return { lines: output(gitStatus(repository)) };

  if (action === 'diff') {
    const stagedOnly = args.includes('--staged') || args.includes('--cached');
    const expectedState: GitFileState = stagedOnly ? 'staged' : 'modified';
    const changedFiles = Object.entries(repository.files).filter(([, state]) => state === expectedState);
    if (!changedFiles.length) return { lines: output(stagedOnly ? 'Không có thay đổi trong staging area.' : 'Không có thay đổi chưa stage.', 'system') };
    return {
      lines: output(
        changedFiles
          .map(([file]) => `diff --git a/${file} b/${file}\n--- a/${file}\n+++ b/${file}\n@@ -1 +1 @@\n-old content\n+updated content`)
          .join('\n\n'),
      ),
    };
  }

  if (action === 'add') {
    const target = args[0];
    if (!target) return { lines: output('Cách dùng: git add <file> hoặc git add .', 'error') };
    const next = cloneRepository(repository);
    const files = target === '.' ? Object.keys(next.files) : [target];
    const missing = files.find((file) => !next.files[file]);
    if (missing) return { lines: output(`fatal: pathspec '${missing}' did not match any files`, 'error') };
    for (const file of files) {
      if (next.files[file] !== 'clean') next.files[file] = 'staged';
    }
    return { repository: next, lines: output(`Đã đưa ${target === '.' ? 'các thay đổi' : target} vào staging area.`, 'success') };
  }

  if (action === 'commit') {
    const stagedFiles = Object.entries(repository.files).filter(([, state]) => state === 'staged');
    if (!stagedFiles.length) return { lines: output('nothing to commit, working tree clean', 'error') };
    const messageIndex = args.indexOf('-m');
    const message = messageIndex >= 0 ? args[messageIndex + 1] : undefined;
    if (!message) return { lines: output('Cách dùng: git commit -m "nội dung commit"', 'error') };
    const next = cloneRepository(repository);
    const hash = (0x71a2c3 + next.commits.length * 0x91d7).toString(16).slice(0, 7);
    next.commits.unshift({ hash, message });
    for (const [file, state] of Object.entries(next.files)) {
      if (state === 'staged') next.files[file] = 'clean';
    }
    return {
      repository: next,
      lines: output(`[${next.branch} ${hash}] ${message}\n ${stagedFiles.length} file(s) changed`, 'success'),
    };
  }

  if (action === 'log') {
    if (!repository.commits.length) return { lines: output('fatal: your current branch does not have any commits yet', 'error') };
    return { lines: output(repository.commits.map((commit, index) => `${index === 0 ? '* ' : '  '}${commit.hash} ${commit.message}`).join('\n')) };
  }

  if (action === 'branch') {
    const branchName = args[0];
    if (!branchName) {
      return { lines: output(repository.branches.map((branch) => `${branch === repository.branch ? '* ' : '  '}${branch}`).join('\n')) };
    }
    if (repository.branches.includes(branchName)) return { lines: output(`fatal: a branch named '${branchName}' already exists`, 'error') };
    const next = cloneRepository(repository);
    next.branches.push(branchName);
    return { repository: next, lines: output(`Đã tạo branch ${branchName}.`, 'success') };
  }

  if (action === 'switch') {
    const create = args[0] === '-c';
    const branchName = create ? args[1] : args[0];
    if (!branchName) return { lines: output('Cách dùng: git switch <branch> hoặc git switch -c <branch>', 'error') };
    const next = cloneRepository(repository);
    if (create) {
      if (next.branches.includes(branchName)) return { lines: output(`fatal: branch '${branchName}' đã tồn tại`, 'error') };
      next.branches.push(branchName);
    } else if (!next.branches.includes(branchName)) {
      return { lines: output(`fatal: invalid reference: ${branchName}`, 'error') };
    }
    next.branch = branchName;
    return { repository: next, lines: output(`${create ? 'Switched to a new branch' : 'Switched to branch'} '${branchName}'`, 'success') };
  }

  if (action === 'merge') {
    const sourceBranch = args[0];
    if (!sourceBranch) return { lines: output('Cách dùng: git merge <branch>', 'error') };
    if (!repository.branches.includes(sourceBranch)) return { lines: output(`merge: ${sourceBranch} - not something we can merge`, 'error') };
    if (sourceBranch === repository.branch) return { lines: output('Already up to date.', 'system') };
    const next = cloneRepository(repository);
    const hash = (0x8d4ef1 + next.commits.length * 0x4721).toString(16).slice(0, 7);
    next.commits.unshift({ hash, message: `Merge branch '${sourceBranch}'` });
    return { repository: next, lines: output(`Merge made by the 'ort' strategy.\n ${sourceBranch} → ${next.branch}`, 'success') };
  }

  if (action === 'restore') {
    const unstage = args.includes('--staged');
    const target = args.find((arg) => !arg.startsWith('-'));
    if (!target || !repository.files[target]) return { lines: output('Cách dùng: git restore [--staged] <file>', 'error') };
    const next = cloneRepository(repository);
    if (unstage) {
      if (next.files[target] !== 'staged') return { lines: output(`${target} không nằm trong staging area.`, 'system') };
      next.files[target] = 'modified';
      return { repository: next, lines: output(`Đã bỏ stage ${target}, nội dung sửa vẫn được giữ.`, 'success') };
    }
    if (next.files[target] === 'untracked') return { lines: output(`error: pathspec '${target}' is untracked`, 'error') };
    next.files[target] = 'clean';
    return { repository: next, lines: output(`Đã khôi phục ${target} về commit gần nhất.`, 'success') };
  }

  if (action === 'stash') {
    const next = cloneRepository(repository);
    if (args[0] === 'pop') {
      if (!next.stashCount) return { lines: output('No stash entries found.', 'error') };
      next.stashCount -= 1;
      next.files['app.js'] = 'modified';
      next.files['deploy.sh'] = 'untracked';
      return { repository: next, lines: output(`On branch ${next.branch}\nDropped refs/stash@{0}`, 'success') };
    }
    const dirtyFiles = Object.entries(next.files).filter(([, state]) => state !== 'clean');
    if (!dirtyFiles.length) return { lines: output('No local changes to save', 'system') };
    for (const [file, state] of dirtyFiles) {
      if (state === 'untracked') delete next.files[file];
      else next.files[file] = 'clean';
    }
    next.stashCount += 1;
    return { repository: next, lines: output(`Saved working directory and index state WIP on ${next.branch}`, 'success') };
  }

  if (action === 'remote') {
    if (args[0] === 'add' && args[1] === 'origin' && args[2]) {
      const next = cloneRepository(repository);
      next.remote = true;
      return { repository: next, lines: output('Đã thêm remote origin.', 'success') };
    }
    if (args[0] === '-v') {
      return { lines: output(repository.remote ? 'origin  https://github.com/tiendat13ns/devopags.git (fetch)\norigin  https://github.com/tiendat13ns/devopags.git (push)' : '(chưa có remote)', 'output') };
    }
    return { lines: output(repository.remote ? 'origin' : '(chưa có remote)') };
  }

  if (['fetch', 'pull', 'push'].includes(action)) {
    if (!repository.remote) return { lines: output('fatal: No configured push destination.', 'error') };
    const messages: Record<string, string> = {
      fetch: 'Đã mô phỏng tải thông tin mới từ origin.',
      pull: 'Already up to date.',
      push: `Đã mô phỏng push branch ${repository.branch} lên origin.`,
    };
    return { lines: output(messages[action], 'success') };
  }

  return { lines: output(`git: '${action}' is not a git command. Gõ “help” để xem lệnh hỗ trợ.`, 'error') };
}

function GitPlayground() {
  const [repository, setRepository] = useState<GitRepository>(() => createInitialGitRepository());
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: 'system', text: 'DevOpags Git Playground · repository mô phỏng an toàn' },
    { kind: 'system', text: 'Repo đang có file modified và untracked. Hãy bắt đầu với “git status”.' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const stagedCount = Object.values(repository.files).filter((state) => state === 'staged').length;
  const workingCount = Object.values(repository.files).filter((state) => state === 'modified' || state === 'untracked').length;

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  function resetGitPlayground() {
    setRepository(createInitialGitRepository());
    setInput('');
    setHistory([]);
    setHistoryIndex(0);
    setLines([
      { kind: 'system', text: 'Git Playground đã được khôi phục.' },
      { kind: 'system', text: 'Gõ “git status” để kiểm tra repository.' },
    ]);
    inputRef.current?.focus();
  }

  function submitGitCommand(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;
    const nextHistory = [...history, command];
    const result = executeGitCommand(command, repository);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length);
    setInput('');

    if (result.reset) {
      resetGitPlayground();
      return;
    }
    if (result.clear) {
      setLines([]);
      return;
    }
    if (result.repository) setRepository(result.repository);
    setLines((current) => [
      ...current,
      { kind: 'command', command, path: `~/project (${repository.branch})` },
      ...(result.lines ?? []),
    ]);
  }

  function handleGitKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!history.length) return;
      const nextIndex = Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? '');
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = Math.min(history.length, historyIndex + 1);
      setHistoryIndex(nextIndex);
      setInput(nextIndex === history.length ? '' : history[nextIndex] ?? '');
    }
    if (event.key === 'Tab') {
      const prefix = input.startsWith('git ') ? input.slice(4) : '';
      if (!prefix || prefix.includes(' ')) return;
      const matches = GIT_SUBCOMMANDS.filter((command) => command.startsWith(prefix.toLowerCase()));
      if (matches.length === 1) {
        event.preventDefault();
        setInput(`git ${matches[0]}`);
      }
    }
  }

  function selectGitSuggestion(command: string) {
    setInput(command);
    inputRef.current?.focus();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section className="overflow-hidden rounded-2xl border border-[#6f32a8] bg-[#100b18] shadow-[0_28px_80px_-40px_rgba(111,50,168,0.9)]" aria-label="Git terminal mô phỏng">
        <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#1a1026] px-4">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#5a189a]" />
            <span className="size-3 rounded-full bg-[#9d4edd]" />
            <span className="size-3 rounded-full bg-[#c77dff]" />
          </div>
          <span className="font-mono text-xs font-semibold text-white/55">devopags — git:{repository.branch}</span>
          <div className="flex items-center gap-1">
            <button className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-[#dfa8ff]" type="button" onClick={() => setLines([])} aria-label="Xóa nội dung terminal" title="Xóa terminal">
              <Trash2 size={15} />
            </button>
            <button className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-[#dfa8ff]" type="button" onClick={resetGitPlayground} aria-label="Khôi phục Git Playground" title="Khôi phục">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        <div ref={outputRef} className="h-[430px] overflow-y-auto px-4 py-5 font-mono text-[13px] leading-6 sm:px-5 sm:text-sm" aria-live="polite">
          {lines.map((line, index) =>
            line.kind === 'command' ? (
              <div className="break-words" key={`${line.command}-${index}`}>
                <span className="font-semibold text-[#c77dff]">devopags@lab</span>
                <span className="font-semibold text-[#67d9ff]">:{line.path}</span>
                <span className="text-white">$ {line.command}</span>
              </div>
            ) : (
              <pre
                className={`whitespace-pre-wrap break-words font-mono ${line.kind === 'error' ? 'text-[#ff6b81]' : line.kind === 'success' ? 'text-[#63d7a4]' : line.kind === 'system' ? 'text-[#ffd166]' : 'text-[#c9c1d4]'}`}
                key={`${line.text}-${index}`}
              >
                {line.text}
              </pre>
            ),
          )}

          <form className="mt-1 flex min-w-0 items-center" onSubmit={submitGitCommand}>
            <label className="sr-only" htmlFor="git-command">Nhập lệnh Git</label>
            <span className="shrink-0 font-semibold text-[#c77dff]">devopags@lab</span>
            <span className="shrink-0 font-semibold text-[#67d9ff]">:~/project</span>
            <span className="shrink-0 font-semibold text-[#63d7a4]">({repository.branch})</span>
            <span className="shrink-0 text-white">$&nbsp;</span>
            <input
              ref={inputRef}
              id="git-command"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-white caret-[#dfa8ff] outline-none placeholder:text-white/25"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleGitKeyDown}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="git status"
            />
            <button className="ml-2 grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/55 transition hover:border-[#9d4edd] hover:text-[#dfa8ff]" type="submit" aria-label="Chạy lệnh Git">
              <CornerDownLeft size={15} />
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#160d20] px-4 py-2.5 font-mono text-[11px] text-white/35 sm:px-5">
          <span>branch: {repository.branch} · staged: {stagedCount} · working: {workingCount}</span>
          <span>repository ảo · không push dữ liệu thật</span>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-primary">
            <GitBranch size={17} />
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Git workflow</h2>
          </div>
          <div className="mt-4 space-y-2">
            {GIT_SUGGESTIONS.map((suggestion) => (
              <button className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition hover:border-primary/45 hover:bg-accent" type="button" key={suggestion.command} onClick={() => selectGitSuggestion(suggestion.command)}>
                <span className="block text-sm font-semibold text-ink">{suggestion.label}</span>
                <code className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-primary">$ {suggestion.command}</code>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">Ba vùng của Git</h2>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li><span className="font-bold text-ink">1. Working tree</span> — file đang sửa</li>
            <li><span className="font-bold text-ink">2. Staging area</span> — nội dung chuẩn bị commit</li>
            <li><span className="font-bold text-ink">3. Repository</span> — lịch sử đã lưu</li>
          </ol>
        </section>
      </aside>
    </div>
  );
}
