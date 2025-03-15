interface Props {
  open: boolean;
}

const SideBar = (props: Props) => {
  return (
    <div
      className={`flex-none h-screen bg-gray-800 transition-all duration-300 ${
        props.open ? "w-64" : "w-16"
      }`}
    ></div>
  );
};

export default SideBar;
