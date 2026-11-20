import { useState, type ReactNode } from "react";

// Mounts children on first open, then keeps them so exit animations still play.
const MountOnOpen = ({ open, children }: { open: boolean; children: ReactNode }) => {
  const [seen, setSeen] = useState(open);
  if (open && !seen) setSeen(true);
  return seen || open ? <>{children}</> : null;
};

export default MountOnOpen;
