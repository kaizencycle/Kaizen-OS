export type LessonPlan = {
  title: string;
  objectives?: string[];
  sections?: { title: string; summary?: string; content?: string; quick_checks?: string[] }[];
  practice?: { prompt: string }[];
  takeaways?: string[];
};

export type Booklet = {
  title: string;
  subtitle?: string;
  lessons: LessonPlan[];
};

function mdEscape(s = ""): string {
  return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function bookletToMarkdown(b: Booklet): string {
  const lines: string[] = [];
  const now = new Date().toLocaleDateString();
  // cover
  lines.push(`# ${mdEscape(b.title || "OAA Booklet")}`);
  if (b.subtitle) lines.push(`_${mdEscape(b.subtitle)}_`);
  lines.push(`_Generated ${now} by OAA_`);
  lines.push("");
  // TOC
  lines.push("## Table of Contents");
  b.lessons.forEach((l, i) => lines.push(`${i + 1}. ${mdEscape(l.title || "Lesson")}`));
  lines.push("");
  // lessons
  b.lessons.forEach((l, i) => {
    lines.push(`---`);
    lines.push(``);
    lines.push(`## ${i + 1}. ${mdEscape(l.title || "Lesson")}`);
    if (l.objectives?.length) {
      lines.push("### Objectives");
      for (const o of l.objectives) lines.push(`- ${mdEscape(o)}`);
      lines.push("");
    }
    if (l.sections?.length) {
      lines.push("### Sections");
      l.sections.forEach((s, si) => {
        lines.push(`#### ${i + 1}.${si + 1} ${mdEscape(s.title || "Section")}`);
        if (s.summary) { lines.push(""); lines.push(mdEscape(s.summary)); lines.push(""); }
        if (s.content) { lines.push("```"); lines.push(s.content.trim()); lines.push("```"); lines.push(""); }
        if (s.quick_checks?.length) {
          lines.push("**Quick checks**");
          for (const q of s.quick_checks) lines.push(`- ${mdEscape(q)}`);
          lines.push("");
        }
      });
    }
    if (l.practice?.length) {
      lines.push("### Practice");
      for (const p of l.practice) lines.push(`- ${mdEscape(p.prompt)}`);
      lines.push("");
    }
    if (l.takeaways?.length) {
      lines.push("### Key Takeaways");
      for (const t of l.takeaways) lines.push(`- ${mdEscape(t)}`);
      lines.push("");
    }
  });
  lines.push("---");
  lines.push("_End of Booklet_");
  return lines.join("\n");
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
