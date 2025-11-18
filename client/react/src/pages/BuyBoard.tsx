import {useState} from "react";
import {handleAddBoard} from "../api";


export default function BuyBoard() {
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [fieldsCount, setFieldsCount] = useState(5);

    const toggleNumber = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers((prev) => prev.filter((n) => n !== num));
            return;
        }

        if (selectedNumbers.length < fieldsCount) {
            setSelectedNumbers((prev) => [...prev, num]);
        }
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

            {/* Submit button */}
            <button
                className="btn btn-primary w-32 h-12 font-bold"
                onClick={() => {
                    if (selectedNumbers.length !== fieldsCount) {
                        alert(`Please select exactly ${fieldsCount} numbers`);
                        return;
                    }
                    handleAddBoard(selectedNumbers);
                }}
            >
                Submit
            </button>
        </div>
    );
}