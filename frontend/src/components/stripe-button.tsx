import React, { useEffect } from "react";

const StripeButton: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/buy-button.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
        <stripe-buy-button
            buy-button-id="buy_btn_1PGow3AKPHx99o8IGvwDtS4E"
            publishable-key="pk_live_51NA1xHAKPHx99o8I87C1SBDbmMDaxuiuL3l4hGjNtkcDQv1xFhV900UB8oX6J2iHM8IYVnN6OPDQ4QzqLWCeZeOi00m2L6N4MM"
        ></stripe-buy-button>
    `,
      }}
    ></div>
  );
};

export default StripeButton;
