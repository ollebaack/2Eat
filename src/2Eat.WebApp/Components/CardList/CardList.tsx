import Card from "../Card/Card";

const CardList = () => {
  return (
    <div>
      <Card companyName="Microsoft" price={100} ticker="test" />
      <Card companyName="Apple" price={200} ticker="test" />
      <Card companyName="Google" price={300} ticker="test" />
    </div>
  );
};

export default CardList;
