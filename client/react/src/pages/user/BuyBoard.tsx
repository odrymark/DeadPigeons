import { useAtom } from "jotai";
import {handleAddBoard, handleGetBalance} from "../../api";
import {useState} from "react";
import {balanceAtom} from "../../atoms/balanceAtom.ts";

export default function BuyBoard() {
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [fieldsCount, setFieldsCount] = useState(5);
    const [, setBalance] = useAtom(balanceAtom);

    const [repeatEnabled, setRepeatEnabled] = useState(false);
    const [repeatCount, setRepeatCount] = useState(1);

    const toggleNumber = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers((prev) => prev.filter((n) => n !== num));
            return;
        }

        if (selectedNumbers.length < fieldsCount) {
            setSelectedNumbers((prev) => [...prev, num]);
        }
    };

    const handleSubmit = async () => {
        if (selectedNumbers.length !== fieldsCount) {
            alert(`Please select exactly ${fieldsCount} numbers`);
            return;
        }

        await handleAddBoard({numbers: selectedNumbers, repeats: repeatEnabled ? repeatCount : 0});

        const balance = await handleGetBalance();
        setBalance(balance);

        setSelectedNumbers([]);
        setRepeatEnabled(false);
        setRepeatCount(1);
    };

    const gridNumbers = Array.from({ length: 16 }, (_, i) => i + 1);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200">
            <h1 className="text-2xl font-bold mb-4">Select Your Numbers</h1>

            {/* Numbers */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {gridNumbers.map((num) => (
                    <button
                        key={num}
                        className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg border 
              ${selectedNumbers.includes(num) ? "bg-blue-500 text-white" : "bg-white text-black"}
              ${!selectedNumbers.includes(num) && selectedNumbers.length >= fieldsCount ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => toggleNumber(num)}
                        disabled={!selectedNumbers.includes(num) && selectedNumbers.length >= fieldsCount}
                    >
                        {num}
                    </button>
                ))}
            </div>

            {/* Fields selector */}
            <div className="mb-4">
                <label className="mr-2 font-semibold">Select number of fields: </label>
                <select
                    value={fieldsCount}
                    onChange={(e) => {
                        const newCount = Number(e.target.value);
                        setFieldsCount(newCount);

                        if (selectedNumbers.length > newCount) {
                            setSelectedNumbers((prev) => prev.slice(0, newCount));
                        }
                    }}
                    className="select select-bordered"
                >
                    {Array.from({ length: 4 }, (_, i) => i + 5).map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
            </div>

            {/* Repeat Toggle */}
            <div className="mb-4 flex items-center gap-3">
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={repeatEnabled}
                    onChange={() => setRepeatEnabled(!repeatEnabled)}
                />
                <span className="font-semibold">Repeat for multiple weeks</span>
            </div>

            {/* Repeat Count Input*/}
            {repeatEnabled && (
                <div className="mb-4 flex flex-col items-center">
                    <label className="font-semibold mb-1">Number of repeats:</label>
                    <input
                        type="number"
                        min={1}
                        className="input input-bordered w-32 text-center"
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(Number(e.target.value))}
                    />
                </div>
            )}

            {/* Submit button */}
            <button
                className="btn btn-primary w-32 h-12 font-bold"
                onClick={() => handleSubmit()}
            >
                Submit
            </button>
        </div>
    );
}