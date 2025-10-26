import argparse, json, os, random, numpy as np

def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episodes", required=True)
    ap.add_argument("--rm", required=False)
    ap.add_argument("--out", required=True)
    return ap.parse_args()

def hash_ctx(ctx: dict):
    hour = ctx.get("hour", 12)
    tier = 1 if ctx.get("user_tier") == "pro" else 0
    task_len = len(ctx.get("task",""))
    return np.array([1.0, float(hour)/24.0, float(tier), float(task_len)/50.0])

def load_episodes(path):
    X, A, R = [], [], []
    with open(path) as f:
        for line in f:
            try:
                rec = json.loads(line)
            except:
                continue
            if rec.get("type") == "decision":
                ctx = rec.get("context", {})
                x = hash_ctx(ctx)
                a = rec.get("action", "default")
                r = rec.get("reward", None)
                if r is None:
                    r = 1.0 if random.random() > 0.5 else 0.0
                X.append(x); A.append(a); R.append(r)
    return np.array(X), np.array(A), np.array(R)

def train_linucb(X, A, R):
    arms = list(sorted(set(A.tolist()))) or ["default"]
    policy = {"type": "linucb", "version": "v1", "alpha": 1.0, "arms": arms, "theta": {}}
    return policy

def main():
    args = parse_args()
    X, A, R = load_episodes(args.episodes)
    policy = train_linucb(X, A, R)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w") as f:
        json.dump(policy, f, indent=2)
    print("Wrote policy to", args.out)

if __name__ == "__main__":
    main()

