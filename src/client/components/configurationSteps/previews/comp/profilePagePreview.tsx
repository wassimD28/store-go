import Image from "next/image";

function ProfilePagePreview() {
    return (
      <div className="col-span-2 col-start-2 row-start-3 rounded-lg shadow-custom-md">
        <div className="flex h-full w-full flex-col items-center justify-center p-3 pt-4">
          <Image
            className="mb-2 rounded-full"
            src="/images/profile-image-example.png"
            alt="profile image"
            width={70}
            height={70}
          />
          <span className="flex-center flex-col">
            <h2 className="text-sm font-semibold text-black">
              Keira Knightley
            </h2>
            <p className="mb-3 text-xs text-black/50">@keirakn</p>
          </span>
          <div className="flex h-full w-full flex-col gap-0.5 rounded-lg bg-gray-100 px-3 py-2">
            <h2 className="text-xs font-semibold text-black">
              Keira Knightley
            </h2>
            <p className="text-xs text-black/30">Knightley001@gmail.com</p>
            <p className="text-xs text-black/30">121-224-7890</p>
          </div>
        </div>
      </div>
    );
}

export default ProfilePagePreview;