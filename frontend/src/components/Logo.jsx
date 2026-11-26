import { Sparkles } from "lucide-react";
export default function Logo({ compact = false }) {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Sparkles size={19} />
      </span>
      {!compact && (
        <span>
          ascend<span className="brand-accent">ai</span>
        </span>
      )}
    </div>
  );
}
