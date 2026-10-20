// Shared by the runner and the network integration test. No URL becomes a CLI argument.
export const CREATE_OPTIONS = [
  "--name", "prospeo-analysis-job", "--network", "prospeo-analysis", "--pull=never", "--interactive",
  "--read-only", "--cap-drop=ALL", "--cap-add=NET_ADMIN", "--cap-add=SETUID", "--cap-add=SETGID", "--cap-add=SETPCAP",
  "--security-opt=no-new-privileges", "--memory=128m", "--memory-swap=128m", "--cpus=0.5", "--pids-limit=32", "--ulimit=nofile=64:64", "--log-driver=none",
];
