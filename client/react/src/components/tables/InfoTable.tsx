import type { UserInfoGet } from "../../api";

interface Props {
    userInfo: UserInfoGet | null;
}

export default function InfoTable({ userInfo }: Props) {
    if (!userInfo) {
        return (
            <div className="bg-base-200 text-center text-base-content/60 mt-8">
                No user selected.
            </div>
        );
    }

    const dateFields: (keyof UserInfoGet)[] = ["createdAt", "lastLogin"];

    const formatValue = (key: keyof UserInfoGet, value: UserInfoGet[keyof UserInfoGet]) => {
        if (dateFields.includes(key) && value) {
            return new Date(value as string).toLocaleString();
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        if (value === null || value === undefined) {
            return "–";
        }

        return String(value);
    };

    const entries = Object.entries(userInfo) as [keyof UserInfoGet, UserInfoGet[keyof UserInfoGet]][];

    return (
        <div className="bg-base-200 overflow-x-auto max-w-3xl mx-auto w-full mt-4">
            <table className="table table-zebra bg-base-200 w-full shadow-md rounded-box">
                <thead>
                <tr>
                    <th className="text-left w-1/3">Field</th>
                    <th className="text-left">Value</th>
                </tr>
                </thead>
                <tbody>
                {entries.map(([key, value]) => (
                    <tr key={key as string} className="hover">
                        <td className="font-semibold capitalize">
                            {String(key).replace(/([A-Z])/g, " $1").trim()}
                        </td>
                        <td>{formatValue(key, value)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}