#!/data/data/com.termux/files/usr/bin/bash

SESSION="bluedoor"

# kill existing session if exists
tmux kill-session -t $SESSION 2>/dev/null

# create new session
tmux new-session -d -s $SESSION

# pane 0 - redis
tmux send-keys -t $SESSION "redis-server" C-m

# split pane 1 - event bus
tmux split-window -h -t $SESSION
tmux send-keys -t $SESSION "cd ~/bluedoor_control_plane/event-bus && node src/index.js" C-m

# pane 2 - registry
tmux split-window -v -t $SESSION:0.1
tmux send-keys -t $SESSION "cd ~/bluedoor_control_plane/services/registry-service && node index.js" C-m

# pane 3 - policy
tmux split-window -v -t $SESSION:0.0
tmux send-keys -t $SESSION "cd ~/bluedoor_control_plane/services/policy-service && node index.js" C-m

# pane 4 - audit
tmux split-window -h -t $SESSION:0.2
tmux send-keys -t $SESSION "cd ~/bluedoor_control_plane/services/audit-service && node index.js" C-m

# pane 5 - execution
tmux split-window -h -t $SESSION:0.3
tmux send-keys -t $SESSION "cd ~/bluedoor_control_plane/services/execution-service && node index.js" C-m

# pane 6 - risk
tmux split-window -v -t $SESSION:0.4
tmux send-keys -t $SESSION "cd ~/bluedoor_control_plane/services/risk-service && node index.js" C-m

# pane 7 - worker
tmux split-window -v -t $SESSION:0.5
tmux send-keys -t $SESSION "cd ~/bluedoor_control_plane && node worker.js" C-m

# attach
tmux attach -t $SESSION
