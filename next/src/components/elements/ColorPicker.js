export default function ColorPicker({ title, name, nameHex, value, setValue, disabled }) {
  const handleChange = e => setValue(e.target.value)

  return (
    <>
      <label htmlFor="text-color" className={`text-xs block text-sm/6 font-medium ${disabled ? "text-gray-300" : "text-gray-600"}`}>
        {title}
      </label>
      <div className="flex flex-row items-stretch">
        <input
          type="color"
          id={name}
          name={name}
          className="h-8 w-10 bg-white border border-gray-300 cursor-pointer rounded-md disabled:opacity-50 disabled:pointer-events-none rounded-e-none border-r-0"
          title="Choose your text color"
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
        <input
          type="text"
          name={nameHex}
          className="px-2 py-1 border border-gray-300 rounded-md rounded-s-none text-sm shadow-sm text-dark max-w-32 font-mono disabled:text-gray-300 disabled:border-gray-100"
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </>
  )
}