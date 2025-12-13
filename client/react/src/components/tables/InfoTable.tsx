import type { UserInfoGet } from "../../api";

interface Props {
    userInfo: UserInfoGet | null;
}

export default function InfoTable({ userInfo }: Props) {
    if (!userInfo) {
        return (
            <div className="text-center text-gray-500 mt-6">
                No user selected.
            </div>
        );
    }

    const dateFields: (keyof UserInfoGet)[] = ["createdAt", "lastLogin"];

    const formatValue = (key: keyof UserInfoGet, value: any) => {
        if (dateFields.includes(key)) {
            return new Date(value).toLocaleString();
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        return String(value);
    };

    const entries = Object.entries(userInfo) as [keyof UserInfoGet, any][];

    return (
        <>
            <div className="mt-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                {entries.map(([key, value]) => (
                    <div
                        key={key}
                        className="grid grid-cols-1 sm:grid-cols-2 bg-base-100 p-4 shadow rounded-lg items-center gap-2"
                    >
                        <div className="font-semibold capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                        </div>

                        <div>{formatValue(key, value)}</div>
                    </div>
                ))}
            </div>
        </>
    );
}