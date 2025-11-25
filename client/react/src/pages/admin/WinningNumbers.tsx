import { useState } from "react";
import {handleAddWinningNumbers} from "../../api";

export default function AddWinningNumbers() {
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const maxCount = 3;

    const toggleNumber = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(prev => prev.filter(n => n !== num));
            return;
        }

        if (selectedNumbers.length < maxCount) {
            setSelectedNumbers(prev => [...prev, num]);
        }
    };

    const handleSubmit = async () => {
        if (selectedNumbers.length !== maxCount) {
            alert("Please select exactly 3 numbers.");
            return;
        }

        await handleAddWinningNumbers(selectedNumbers);
        setSelectedNumbers([]);
    };

    const gridNumbers = Array.from({ length: 16 }, (_, i) => i + 1);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200">
            <h1 className="text-2xl font-bold mb-4">Add Weekly Winning Numbers</h1>
            <p className="mb-4 text-gray-700">Select 3 numbers:</p>

            {/* Number grid */}
            <div className="grid grid-cols-4 gap-2 mb-6">
                {gridNumbers.map(num => (
                    <button
                        key={num}
                        className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg border 
                        ${selectedNumbers.includes(num) ? "bg-red-500 text-white" : "bg-white text-black"}
                        ${!selectedNumbers.includes(num) && selectedNumbers.length >= maxCount ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => toggleNumber(num)}
                        disabled={!selectedNumbers.includes(num) && selectedNumbers.length >= maxCount}
                    >
                        {num}
                    </button>
                ))}
            </div>

            {/* Submit */}
            <button className="btn w-40 h-12" onClick={() => handleSubmit()}>
                Submit Numbers
            </button>
        </div>
    );
}