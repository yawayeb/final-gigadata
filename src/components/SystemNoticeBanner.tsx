import { useState } from "react";


export const SystemNoticeBanner = () => {
  const [dismissed] = useState(true);
  const [mounted] = useState(true);

  if (!mounted || dismissed) return null;

  return null;
};
