import { Kbd, Modal, ModalDescription, ModalTitle } from "@kjaniec-dev/ui";

export interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Navigation",
    items: [
      { keys: ["1"], description: "Go to Overview" },
      { keys: ["2"], description: "Go to Components" },
      { keys: ["3"], description: "Go to Patterns" },
      { keys: ["4"], description: "Go to Tokens" },
      { keys: ["5"], description: "Go to MCP (AI Tools)" },
      { keys: ["⌘", "K"], description: "Global Command Palette search" },
      { keys: ["/"], description: "Quick search / filter components" },
    ],
  },
  {
    title: "Actions & Theme",
    items: [
      { keys: ["T"], description: "Toggle Dark / Light color scheme" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close modal / drawer / palette" },
    ],
  },
];

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} width={480}>
      <div className="flex flex-col gap-5">
        <div>
          <ModalTitle className="text-lg font-bold text-foreground">Keyboard Shortcuts</ModalTitle>
          <ModalDescription className="text-sm text-muted-foreground mt-1">
            Navigate and control the KJ Product Kit showcase with your keyboard.
          </ModalDescription>
        </div>

        <div className="flex flex-col gap-5 divide-y divide-border">
          {SHORTCUT_CATEGORIES.map((cat) => (
            <div key={cat.title} className="pt-4 first:pt-0 flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                {cat.title}
              </span>
              <div className="flex flex-col gap-2">
                {cat.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between py-1 text-sm"
                  >
                    <span className="text-foreground font-medium">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-kj-sm text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer border border-border"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}
