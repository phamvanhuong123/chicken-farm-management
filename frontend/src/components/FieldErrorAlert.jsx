function FieldErrorAlert({ errors, fieldName }) {
  
  if (!errors || !errors[fieldName]) return null
  return (
    <div
      className="mt-3 flex items-start gap-2 rounded-md  p-1 text-sm text-red-700 "
      role="alert"
    >
      {/* Icon cảnh báo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 flex-shrink-0 text-red-500 mt-[2px]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
      </svg>

      {/* Nội dung lỗi */}
      <p className="overflow-hidden text-ellipsis">
        {errors[fieldName]?.message}
      </p>
    </div>
  )
}

export default FieldErrorAlert
