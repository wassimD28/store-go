interface props {
  params: {
    storeId: string;
  };
}
function Page({params}: props) {
    return <div className="flex-center w-full h-full uppercase text-2lg">store id : {params.storeId}</div>;
}

export default Page;