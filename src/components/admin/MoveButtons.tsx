import { ArrowDownIcon, ArrowUpIcon } from "./icons";
import { iconBtn } from "./ui";

// Up/down reorder controls; `action` is a server action taking { id, dir }.
export default function MoveButtons({
  id,
  action,
  isFirst,
  isLast,
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <form action={action} className="flex gap-1">
      <input type="hidden" name="id" value={id} />
      <button name="dir" value="up" disabled={isFirst} className={iconBtn} aria-label="Move up">
        <ArrowUpIcon />
      </button>
      <button name="dir" value="down" disabled={isLast} className={iconBtn} aria-label="Move down">
        <ArrowDownIcon />
      </button>
    </form>
  );
}
