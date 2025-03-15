import React, { JSX } from "react";

interface Props {
  companyName: string;
  ticker: string;
  price: number;
}

const Card: React.FC<Props> = ({
  companyName,
  ticker,
  price,
}: Props): JSX.Element => {
  return (
    <div className="flex flex-col items-center justify-between w-full p-6 bg-slate-100 rounded-lg md:flex-row">
      <div>
        <h2 className="font-bold text-center text-veryDarkViolet md:text-left">
          {companyName} ({ticker})
        </h2>
        <p>{price}</p>
        <button>Click Me</button>
      </div>
    </div>
  );
};

export default Card;
