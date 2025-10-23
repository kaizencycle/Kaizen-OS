"use client";

type Subject = {
  name: string;
  prompts: { label: string; text: string }[];
};

const STEM: Subject[] = [
  {
    name: "Math",
    prompts: [
      { label: "Algebra", text: "Explain solving linear equations with examples, then give 3 practice problems." },
      { label: "Calculus", text: "Teach derivative rules (power, product, chain) and 3 quick exercises." },
      { label: "Probability", text: "Show how to compute conditional probability with a real-world example." },
    ],
  },
  {
    name: "Physics",
    prompts: [
      { label: "Mechanics", text: "Explain Newton's laws with a skateboard example; include F=ma practice." },
      { label: "Waves", text: "Compare sound vs light waves; give a simple interference experiment." },
    ],
  },
  {
    name: "Chemistry",
    prompts: [
      { label: "Stoichiometry", text: "Balance a combustion reaction and compute grams-to-moles conversion." },
      { label: "Acids/Bases", text: "Explain pH and buffers; include a home-safe demonstration." },
    ],
  },
  {
    name: "Biology",
    prompts: [
      { label: "Cell", text: "Contrast prokaryotic vs eukaryotic cells; diagram main organelles." },
      { label: "Genetics", text: "Punnett squares: walk through a monohybrid cross with probabilities." },
    ],
  },
  {
    name: "Computer Science",
    prompts: [
      { label: "Algorithms", text: "Explain Big-O with examples (sort/search) and small code snippets." },
      { label: "Data Structures", text: "When to use arrays, hash maps, stacks, queues—with quick tasks." },
    ],
  },
  {
    name: "Engineering",
    prompts: [
      { label: "Circuits", text: "Ohm's law + series vs parallel; design a simple LED circuit." },
      { label: "Design", text: "Teach the engineering design cycle; brainstorm a phone stand project." },
    ],
  },
];

export default function SubjectList({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginTop: 6 }}>STEM Subjects</div>
      <div style={{ display: "grid", gap: 8 }}>
        {STEM.map((s) => (
          <div key={s.name} style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, opacity: 0.9 }}>{s.name}</div>
            <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(2, 1fr)" }}>
              {s.prompts.map((p) => (
                <button key={p.label} onClick={() => onPick(p.text)} style={promptBtn}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const promptBtn: React.CSSProperties = {
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  borderRadius: 8,
  padding: "6px 8px",
  textAlign: "left",
  cursor: "pointer",
};
