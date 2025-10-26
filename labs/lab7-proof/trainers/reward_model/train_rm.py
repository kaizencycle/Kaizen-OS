import argparse, json, os, pickle
from sklearn.linear_model import LogisticRegression

def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episodes", required=True)
    ap.add_argument("--out", required=True)
    return ap.parse_args()

def iter_samples(path):
    X, y = [], []
    with open(path) as f:
        for line in f:
            try:
                rec = json.loads(line)
            except:
                continue
            if rec.get("type") in ("explicit_feedback","implicit_feedback"):
                if rec["type"] == "explicit_feedback":
                    y.append(1 if rec.get("thumbs") == "up" else 0)
                    X.append([1,0,0])
                else:
                    dwell = rec.get("dwell_ms", 0)
                    errors = rec.get("errors", 0)
                    retries = rec.get("retries", 0)
                    label = 1 if (dwell>1500 and errors==0 and retries<2) else 0
                    y.append(label); X.append([dwell/3000.0, errors, retries])
    return X, y

def main():
    args = parse_args()
    X, y = iter_samples(args.episodes)
    if not X:
        print("No feedback found; cannot train RM."); return
    clf = LogisticRegression(max_iter=200)
    clf.fit(X, y)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "wb") as f:
        pickle.dump(clf, f)
    print("Wrote reward model to", args.out)

if __name__ == "__main__":
    main()

