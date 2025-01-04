
export const intCurrencyList = [
  "VND",
  "TWD",
  "LAK",
  "PHP",
  "MMK",
  "JPY",
  "INR",
  "COP",
  "IDR",
  "CLP",
  "PYG",
];
export const currencyPrefixList = ["TWD", "USD", "JPY", "PHP", "IDR", "COP"];
export const dotList = ["USD", "TWD", "JPY", "PHP", "THB", "MYR", "IDR", "INR"];
export const xctCurrencyList = [
  "IDR",
  "KRW",
  "THB",
  "KHR",
  "BDT",
  "KPW",
  "MNT",
]; // Danh sách không hiển thị phần thập phân nếu là 00
export const getFloatChar = (currency: string) =>
  dotList.includes(currency) ? "." : ",";

export const formatInputNumber = (value: any, currency: string) => {
  const floatChar = getFloatChar(currency);
  value = (value || "0").toString();
  if (value.includes(floatChar) && value.indexOf(floatChar) > value.length - 2)
    return value;
  let formatValue = value.replace(/(\.|\,)/g, "");
  if (value.includes(floatChar) && value.indexOf(floatChar) == value.length - 2)
    formatValue += "0";
  if (
    typeof currency !== "undefined" &&
    currency &&
    !intCurrencyList.includes(currency) &&
    !value.includes(floatChar)
  )
    formatValue += "00";
  if (formatValue === "") formatValue = 0;
  formatValue = parseInt(formatValue);
  return formatValue;
};

export const formatNumber = (
  value: any,
  currency: string = "VND",
  prefix = true
) => {
  const floatChar = getFloatChar(currency);
  value = value ? value.toString() : "0";
  if (
    value.includes(floatChar) &&
    !intCurrencyList.includes(currency) &&
    value.indexOf(floatChar) > value.length - 3
  )
    return value;
  const minusChar = parseInt(value) < 0 ? "-" : "";
  let amount: string | number =
    Math.abs(
      parseInt(intCurrencyList.includes(currency) ? Math.round(value) : value)
    ) || 0;
  amount = amount
    ? !intCurrencyList.includes(currency) &&
      typeof currency != "undefined" &&
      currency
      ? `${Math.floor(amount / 100)
          .toString()
          .replace(
            /(\d)(?=(\d{3})+(?!\d))/g,
            `$1${floatChar == "." ? "," : "."}`
          )}${
          Math.abs(amount) % 100
            ? prefix
              ? floatChar +
                (Math.abs(amount) % 100 > 9
                  ? Math.abs(amount) % 100
                  : "0" + (Math.abs(amount) % 100))
              : floatChar +
                ((Math.abs(amount) % 100) % 10
                  ? Math.abs(amount) % 100 > 9
                    ? Math.abs(amount) % 100
                    : "0" + (Math.abs(amount) % 100)
                  : Math.floor((Math.abs(amount) % 100) / 10))
            : prefix && !xctCurrencyList.includes(currency)
            ? `${floatChar}00`
            : ""
        }`
      : amount
          .toString()
          .replace(
            /(\d)(?=(\d{3})+(?!\d))/g,
            `$1${floatChar == "." ? "," : "."}`
          )
    : amount;
  return minusChar + amount;
};

export const convertVN = (
  str: string,
  withoutSpecChar = false,
  ignoreTrim = false
) => {
  str = (str || "").toString().toLowerCase();
  if (!ignoreTrim) str = str.trim();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  if (withoutSpecChar) {
    return str;
  } else {
    return str.replace(/[^a-zA-Z0-9/, ]/g, "");
  }
};

export const getHostName = () => {
  return "http://localhost:8000";
};

export const getPromotionType = {
  1: {
    label: "Khuyến mãi chung",
    color: "orange",
  },
  2: {
    label: "Khuyến mãi theo mã đơn hàng",
    color: "blue",
  },
};

export const getPromotionStatus = {
  1: {
    label: "Đang diễn ra",
    color: "green",
  },
  0: {
    label: "Đã kết thúc",
    color: "red",
  },
};

export const debtStatus = {
  "-1": {
    label: "Hủy",
    color: "red",
  },
  "0": {
    label: "Chưa thanh toán",
    color: "cyan",
  },
  "1": {
    label: "Đã thanh toán",
    color: "green",
  },
  "2": {
    label: "Quá hạn",
    color: "red",
  }
};