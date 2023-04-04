import * as React from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./dialog";

export default { title: "Components/Dialog" };

export const Styled = () => (
  <Dialog>
    <DialogTrigger>open</DialogTrigger>
    <DialogContent>
      <DialogTitle>Booking info</DialogTitle>
      <DialogDescription>Please enter the info for your booking below</DialogDescription>
    </DialogContent>
  </Dialog>
);

export const NonModal = () => (
  <>
    <Dialog modal={false}>
      <DialogTrigger>open (non-modal)</DialogTrigger>
      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        <DialogTitle>Booking info</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </DialogContent>
    </Dialog>

    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} style={{ marginTop: 20 }}>
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <textarea
          style={{ width: 800, height: 400 }}
          defaultValue="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat nobis at ipsa, nihil tempora debitis maxime dignissimos non amet, minima expedita alias et fugit voluptate laborum placeat odio dolore ab!"
        />
      </div>
    ))}
  </>
);

export const Controlled = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{open ? "close" : "open"}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
