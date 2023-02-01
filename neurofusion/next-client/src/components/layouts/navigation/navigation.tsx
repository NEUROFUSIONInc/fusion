import Link from "next/link";
import { FC } from "react";

import { Button, Logo } from "~/components/ui";

export const Navbar: FC = () => {
  return (
    <nav className="container mx-auto flex items-center justify-between">
      <Logo className="w-12" />
      <div className="flex items-center justify-between">
        <Button>
          <Link href="auth/login">Login</Link>
        </Button>
      </div>
    </nav>
  );
};
