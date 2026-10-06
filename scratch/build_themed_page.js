const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'listings', 'new', 'page.tsx');
let code = fs.readFileSync(srcPath, 'utf8');

// Replace the main page wrapper
code = code.replace(
  /<div\s+className="w-full min-h-\[calc\(100vh-4rem\)\] py-8 px-4 sm:px-6 flex items-start justify-center"\s+style=\{\{\s*background:\s*"linear-gradient\(135deg, hsl\(240,20%,4%\) 0%, hsl\(255,25%,7%\) 50%, hsl\(230,20%,5%\) 100%\)"\s*\}\}\s*>/,
  '<div className="w-full min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 flex items-start justify-center bg-background text-foreground">'
);

// Replace max-w-3xl with max-w-4xl
code = code.replace(
  '<div className="max-w-3xl w-full space-y-5">',
  '<div className="max-w-4xl w-full space-y-6">'
);

// Replace Header Card
code = code.replace(
  /<div\s+className="rounded-2xl border border-white\/10 p-5 sm:p-6 shadow-2xl"\s+style=\{\{\s*background:\s*"linear-gradient\(135deg, rgba\(90,60,200,0.25\) 0%, rgba\(60,80,180,0.25\) 100%\)",\s*backdropFilter:\s*"blur\(20px\)"\s*\}\}\s*>/,
  '<div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm relative overflow-hidden">\n          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />'
);

// Replace header compass badge
code = code.replace(
  /<div\s+className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border"\s+style=\{\{\s*background:\s*"rgba\(140,90,255,0.15\)",\s*borderColor:\s*"rgba\(140,90,255,0.3\)",\s*color:\s*"hsl\(265,90%,75%\)"\s*\}\}\s*>/,
  '<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-primary/20 bg-primary/10 text-primary">'
);

// Header title and subtitle
code = code.replace(
  '<h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Register Your Business</h1>',
  '<h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Register Your Business</h1>'
);
code = code.replace(
  '<p className="text-xs text-white/50">Complete all {WIZARD_STEPS.length} steps to list your business globally</p>',
  '<p className="text-xs sm:text-sm text-muted-foreground">Complete all {WIZARD_STEPS.length} steps to list your business globally across local and international directories.</p>'
);

// Header buttons
code = code.replace(
  'className="h-8 text-xs font-bold gap-1.5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"',
  'className="h-8 text-xs font-bold gap-1.5 border-border bg-background hover:bg-muted text-foreground"'
);
code = code.replace(
  /<div\s+className="px-3 py-1.5 rounded-xl border border-white\/15 text-xs font-black text-white\/70"\s+style=\{\{\s*background:\s*"rgba\(90,60,200,0.3\)"\s*\}\}\s*>\s*<span style=\{\{\s*color:\s*"hsl\(265,90%,80%\)"\s*\}\}>\{step\}<\/span>\/7\s*<\/div>/,
  '<div className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-black text-foreground">Step <span className="text-primary">{step}</span>/7</div>'
);

// Draft alert
code = code.replace(
  /<div\s+className="mb-4 p-3 rounded-xl border flex items-center justify-between text-xs gap-3"\s+style=\{\{\s*background:\s*"rgba\(251,146,60,0.1\)",\s*borderColor:\s*"rgba\(251,146,60,0.3\)"\s*\}\}\s*>/,
  '<div className="mb-4 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs gap-3">'
);
code = code.replace(
  '<div className="flex items-center gap-2" style={{ color: "hsl(38,90%,65%)" }}>',
  '<div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">'
);
code = code.replace(
  'className="h-7 text-xs font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/10"',
  'className="h-7 text-xs font-bold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"'
);
code = code.replace(
  'className="text-xs text-white/40 hover:text-red-400 transition-colors"',
  'className="text-xs text-muted-foreground hover:text-red-500 transition-colors"'
);

// Progress bar background
code = code.replace(
  '<div className="w-full h-1 rounded-full" style={{ background: "rgba(100,80,200,0.2)" }}>',
  '<div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">'
);
code = code.replace(
  /<div\s+className="h-full rounded-full transition-all duration-500"\s+style=\{\{\s*width:\s*`\$\{progressPct\}%`,\s*background:\s*"linear-gradient\(90deg, hsl\(265,80%,65%\) 0%, hsl\(142,70%,50%\) 100%\)",\s*boxShadow:\s*"0 0 10px rgba\(140,90,255,0.5\)",\s*\}\}\s*\/>/,
  '<div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />'
);

// Form Card
code = code.replace(
  /<div\s+className="rounded-2xl border border-white\/10 p-5 sm:p-7 shadow-2xl space-y-6"\s+style=\{\{\s*background:\s*"rgba\(18,14,35,0.85\)",\s*backdropFilter:\s*"blur\(20px\)"\s*\}\}\s*>/,
  '<div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">'
);

// Navigation Footer
code = code.replace(
  /<div\s+className="flex items-center justify-between py-4 px-5 rounded-2xl border border-white\/10"\s+style=\{\{\s*background:\s*"rgba\(15,12,30,0.85\)",\s*backdropFilter:\s*"blur\(20px\)"\s*\}\}\s*>/,
  '<div className="flex items-center justify-between pt-4 border-t border-border">'
);
code = code.replace(
  'className="font-bold border-white/20 text-white/70 hover:bg-white/10 hover:text-white"',
  'className="font-bold border-border text-foreground hover:bg-muted"'
);
code = code.replace(
  'className="font-semibold text-white/40 hover:text-white"',
  'className="font-semibold text-muted-foreground hover:text-foreground"'
);
code = code.replace(
  'className="font-semibold text-xs border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:text-white/80"',
  'className="font-semibold text-xs border-dashed border-border text-muted-foreground hover:text-foreground"'
);

// Submit button gradient
code = code.replace(
  /style=\{\{\s*background:\s*step === 7\s*\?[^;]+;\s*\}\}/s,
  'className="font-bold gap-1.5 shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"'
);

// Helpers at the bottom
code = code.replace(
  /<div\s+className="flex items-center gap-3 pb-2 border-b border-white\/10">/,
  '<div className="flex items-center gap-3 pb-3 border-b border-border">'
);
code = code.replace(
  /<div\s+className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"\s+style=\{\{[^}]+\}\}\s*>\s*\{step\}\s*<\/div>/,
  '<div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">{step}</div>'
);
code = code.replace(
  '<h3 className="text-sm font-black text-white">{title}</h3>',
  '<h3 className="text-base font-black text-foreground">{title}</h3>'
);
code = code.replace(
  '<p className="text-xs text-white/40">{subtitle}</p>',
  '<p className="text-xs text-muted-foreground">{subtitle}</p>'
);

// FormField label
code = code.replace(
  '<label className="text-xs font-bold text-white/70 block mb-1">',
  '<label className="text-xs font-bold text-foreground block mb-1">'
);
code = code.replace(
  '<span className="text-red-400">*</span>',
  '<span className="text-red-500">*</span>'
);

// ReviewCard
code = code.replace(
  /<div\s+className="rounded-xl border border-white\/10 p-4 space-y-3"\s+style=\{\{\s*background:\s*"rgba\(20,15,40,0.6\)"\s*\}\}\s*>/,
  '<div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">'
);
code = code.replace(
  '<div className="flex items-center justify-between pb-2 border-b border-white/10">',
  '<div className="flex items-center justify-between pb-2 border-b border-border/70">'
);
code = code.replace(
  '<div className="flex items-center gap-2 font-black text-xs text-white/70">',
  '<div className="flex items-center gap-2 font-black text-xs text-foreground">'
);
code = code.replace(
  /className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors hover:bg-white\/10"\s+style=\{\{\s*color:\s*"hsl\(265,80%,75%\)"\s*\}\}/,
  'className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg text-primary hover:bg-primary/10 transition-colors"'
);

// ReviewField
code = code.replace(
  '<span className="text-[11px] text-white/40 block font-medium">{label}</span>',
  '<span className="text-[11px] text-muted-foreground block font-medium">{label}</span>'
);
code = code.replace(
  '${bold ? "font-bold text-white" : ""}',
  '${bold ? "font-bold text-foreground" : "text-foreground/90"}'
);

fs.writeFileSync(path.join(__dirname, 'new_page_themed.tsx'), code, 'utf8');
console.log('Generated new_page_themed.tsx successfully!');
