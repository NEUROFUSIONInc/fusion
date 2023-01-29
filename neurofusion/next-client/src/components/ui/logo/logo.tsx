import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface LinkProps {
  className?: string;
}

export const Logo: FC<LinkProps> = (props) => {
  return (
    <Link href="/">
      <Image src="/images/logo.png" alt="Neurofusion Logo" width={80} height={80} {...props} />
    </Link>
  );
};
