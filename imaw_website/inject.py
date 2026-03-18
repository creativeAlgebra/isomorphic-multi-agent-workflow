import json

filepath = '/Users/randallgarcia/Desktop/Daily_Backup/research/imaw_website/src/experiments/kubernetes.json'
with open(filepath, 'r') as f:
    data = json.load(f)

std_raw = data['standard_llm']['raw_output']
leaks = ["Kubernetes Cluster", "Control Plane", "kube-apiserver", "etcd", "kube-scheduler", "CPU", "Memory", "Pod", "Node", "kube-controller-manager", "Worker Nodes", "kubelet"]
std_tagged = std_raw
for leak in leaks:
    std_tagged = std_tagged.replace(leak, f"[{leak}](#leak:Technical%20Jargon)")

data['standard_llm']['grades']['tagged_output'] = std_tagged

imaw_raw = data['imaw_pipeline']['raw_output']
imaw_tagged = imaw_raw.replace("smallest deployable unit", "[smallest deployable unit](#leak:smallest%20deployable%20unit)")
data['imaw_pipeline']['grades']['tagged_output'] = imaw_tagged

with open(filepath, 'w') as f:
    json.dump(data, f, indent=2)

print("Injected native markdown tags successfully.")
