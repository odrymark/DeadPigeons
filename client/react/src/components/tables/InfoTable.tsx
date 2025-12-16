import type { UserInfoGet } from "../../api";

interface Props {
    userInfo: UserInfoGet | null;
}

export default function InfoTable({ userInfo }: Props) {
    if (!userInfo) {
        return (
            <div className="text-center text-base-content/60 mt-8">
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

    const filteredEntries = entries.filter(([key]) => !["password"].includes(key));

    return (
        <div className="overflow-x-auto max-w-3xl mx-auto w-full mt-4">
            <table className="table w-full bg-base-100 shadow-md rounded-box">
                <thead>
                <tr className="bg-base-200">
                    <th className="text-left w-1/3">Field</th>
                    <th className="text-left">Value</th>
                </tr>
                </thead>
                <tbody>
                {filteredEntries.map(([key, value]) => (
                    <tr key={key} className="hover">
                        <td className="font-semibold capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                        </td>
                        <td>{formatValue(key, value)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}