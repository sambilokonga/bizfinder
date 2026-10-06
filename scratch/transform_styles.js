const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'listings', 'new', 'page.tsx');
let content = fs.readFileSync(srcPath, 'utf8');

// 1. Root page container
content = content.replace(
  /className="w-full min-h-\[calc\(100vh-4rem\)\] py-8 px-4 sm:px-6 flex items-start justify-center"\s+style=\{\{[^}]+\}\}/,
  'className="w-full min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 flex items-start justify-center bg-background text-foreground"'
);

// 2. Max width
content = content.replace(
  'className="max-w-3xl w-full space-y-5"',
  'className="max-w-4xl w-full space-y-6"'
);

// 3. Header card
content = content.replace(
  /className="rounded-2xl border border-white\/10 p-5 sm:p-6 shadow-2xl"\s+style=\{\{[^}]+\}\}/,
  'className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm relative overflow-hidden"'
);

// 4. Header title badge
content = content.replace(
  /className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border"\s+style=\{\{[^}]+\}\}/,
  'className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-primary/25 bg-primary/10 text-primary"'
);

// 5. Header title & subtitle
content = content.replace(
  '<h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Register Your Business</h1>',
  '<h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Register Your Business</h1>'
);
content = content.replace(
  '<p className="text-xs text-white/50">Complete all {WIZARD_STEPS.length} steps to list your business globally</p>',
  '<p className="text-xs sm:text-sm text-muted-foreground">Complete all {WIZARD_STEPS.length} steps to register and publish your business worldwide.</p>'
);

// 6. Header action buttons
content = content.replace(
  'className="h-8 text-xs font-bold gap-1.5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"',
  'className="h-8 text-xs font-bold gap-1.5 border-border bg-background hover:bg-muted text-foreground"'
);

content = content.replace(
  /className="px-3 py-1.5 rounded-xl border border-white\/15 text-xs font-black text-white\/70"\s+style=\{\{[^}]+\}\}/,
  'className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-black text-foreground"'
);

content = content.replace(
  '<span style={{ color: "hsl(265,90%,80%)" }}>{step}</span>/7',
  'Step <span className="text-primary">{step}</span> of 7'
);

// 7. Draft restore box
content = content.replace(
  /className="mb-4 p-3 rounded-xl border flex items-center justify-between text-xs gap-3"\s+style=\{\{[^}]+\}\}/,
  'className="mb-4 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs gap-3"'
);
content = content.replace(
  'className="flex items-center gap-2" style={{ color: "hsl(38,90%,65%)" }}',
  'className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium"'
);
content = content.replace(
  'className="h-7 text-xs font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/10"',
  'className="h-7 text-xs font-bold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"'
);
content = content.replace(
  'className="text-xs text-white/40 hover:text-red-400 transition-colors"',
  'className="text-xs text-muted-foreground hover:text-red-500 transition-colors"'
);

// 8. Stepper indicator
const oldStepperRegex = /\{\/\* STEP INDICATOR \*\/\}[\s\S]*?\{\/\* PROGRESS BAR \*\/\}/;
const newStepper = `{/* STEP INDICATOR */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {WIZARD_STEPS.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id;
                const isAccessible = s.id <= step;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => isAccessible && setStep(s.id as any)}
                    disabled={!isAccessible}
                    className={\`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all text-center \${
                      isActive
                        ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                        : isDone
                        ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15"
                        : "border-border/60 bg-muted/20 opacity-60 cursor-not-allowed"
                    }\`}
                  >
                    <div
                      className={\`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors \${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }\`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className={\`text-[10px] sm:text-xs font-black truncate \${isActive ? "text-primary" : isDone ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}\`}>
                        {s.label}
                      </div>
                      <div className="text-[9px] text-muted-foreground truncate hidden sm:block">
                        {s.sublabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: \`\${progressPct}%\` }}
              />
            </div>
          </div>`;

content = content.replace(oldStepperRegex, newStepper);

// Also remove old progress bar if separate
content = content.replace(
  /<div className="w-full h-1 rounded-full"[\s\S]*?style=\{\{\s*width:\s*`\$\{progressPct\}%`[\s\S]*?<\/div>\s*<\/div>/,
  ''
);

// 9. Form main card
content = content.replace(
  /className="rounded-2xl border border-white\/10 p-5 sm:p-7 shadow-2xl space-y-6"\s+style=\{\{[^}]+\}\}/,
  'className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6"'
);

// 10. Generic replacements for inputs, labels, and text colors
content = content.replace(/text-white\/80/g, 'text-foreground');
content = content.replace(/text-white\/70/g, 'text-foreground');
content = content.replace(/text-white\/60/g, 'text-muted-foreground');
content = content.replace(/text-white\/50/g, 'text-muted-foreground');
content = content.replace(/text-white\/40/g, 'text-muted-foreground');
content = content.replace(/text-white\/30/g, 'text-muted-foreground/60');
content = content.replace(/text-white\/20/g, 'text-muted-foreground/40');

// Replace border-white/15, border-white/10, border-white/20 with border-border
content = content.replace(/border-white\/15/g, 'border-border');
content = content.replace(/border-white\/10/g, 'border-border');
content = content.replace(/border-white\/20/g, 'border-border');

// Replace bg-white/5, bg-white/10 with bg-background
content = content.replace(/bg-white\/5/g, 'bg-background text-foreground');
content = content.replace(/bg-white\/10/g, 'bg-muted/50');

// Replace placeholder:text-white/30 with placeholder:text-muted-foreground
content = content.replace(/placeholder:text-white\/30/g, 'placeholder:text-muted-foreground');
content = content.replace(/placeholder:text-white\/25/g, 'placeholder:text-muted-foreground');

// Replace text-red-400 with text-red-500
content = content.replace(/text-red-400/g, 'text-red-500');

// Replace container styles style={{ background: "rgba(80,50,160,0.2)" }} with className="... bg-muted/20"
content = content.replace(/style=\{\{\s*background:\s*"rgba\(80,50,160,0\.2\)"\s*\}\}/g, '');
content = content.replace(/style=\{\{\s*background:\s*"rgba\(80,50,160,0\.15\)"\s*\}\}/g, '');
content = content.replace(/style=\{\{\s*background:\s*"rgba\(100,60,200,0\.08\)"\s*\}\}/g, '');
content = content.replace(/style=\{\{\s*background:\s*"rgba\(140,90,255,0\.15\)"\s*\}\}/g, '');

// Step 1: Scale Badges
content = content.replace(
  /style=\{\{\s*borderColor:\s*businessLevel === lvl\s*\?[^}]+\}\}/g,
  ''
);

// Navigation footer
content = content.replace(
  /className="flex items-center justify-between py-4 px-5 rounded-2xl border border-border"\s+style=\{\{[^}]+\}\}/,
  'className="flex items-center justify-between pt-6 border-t border-border mt-4"'
);

// Helpers at the bottom
content = content.replace(
  /<div className="flex items-center gap-3 pb-2 border-border">/,
  '<div className="flex items-center gap-3 pb-3 border-b border-border">'
);
content = content.replace(
  /<div\s+className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"\s+style=\{\{[^}]+\}\}\s*>\s*\{step\}\s*<\/div>/,
  '<div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">{step}</div>'
);
content = content.replace(
  '<h3 className="text-sm font-black text-white">{title}</h3>',
  '<h3 className="text-base font-black text-foreground">{title}</h3>'
);

// ReviewCard
content = content.replace(
  /<div className="rounded-xl border border-border p-4 space-y-3"\s+style=\{\{[^}]+\}\}>/,
  '<div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3 shadow-xs">'
);
content = content.replace(
  'className="flex items-center gap-2 font-black text-xs text-foreground"',
  'className="flex items-center gap-2 font-black text-xs text-foreground"'
);
content = content.replace(
  /className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors hover:bg-muted\/50"\s+style=\{\{[^}]+\}\}/,
  'className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg text-primary hover:bg-primary/10 transition-colors"'
);

// ReviewField
content = content.replace(
  /\$\{bold \? "font-bold text-white" : ""\}/g,
  '${bold ? "font-bold text-foreground" : "text-foreground"}'
);

fs.writeFileSync(path.join(__dirname, 'transformed_page.tsx'), content, 'utf8');
console.log('Transformed page saved!');
