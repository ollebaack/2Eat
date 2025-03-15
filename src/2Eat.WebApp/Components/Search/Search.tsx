import React, { SyntheticEvent } from "react";

type Props = {};

const Search: React.FC<Props> = () => {
  const [search, setSearch] = React.useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const onClick = (e: SyntheticEvent) => {
    console.log(e, search);
  };
  return (
    <div>
      <input value={search} onChange={(e) => handleChange(e)}></input>
      <button onClick={onClick}>Search</button>
    </div>
  );
};

export default Search;
