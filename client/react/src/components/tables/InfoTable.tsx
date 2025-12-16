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
        if (dateFields.includes(key) && value) {
            return new Date(value).toLocaleString();
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        if (value === null || value === undefined) {
            return "–";
        }

        return String(value);
    };

    const entries = Object.entries(userInfo) as [keyof UserInfoGet, any][];

    const filteredEntries = entries.filter(
        ([key]) => !["password"].includes(key)
    );

    return (
        <ul className="list bg-base-100 rounded-box shadow-md max-w-3xl mx-auto w-full mt-4">
            {filteredEntries.map(([key, value]) => (
                <li key={key} className="list-row p-4">
                    <div className="font-semibold capitalize w-48">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>

                    <div className="list-col-grow text-right sm:text-left">
                        {formatValue(key, value)}
                    </div>
                </li>
            ))}
        </ul>
    );
}