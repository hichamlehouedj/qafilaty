import {blue, deepOrange, deepPurple, green, grey, lightGreen, orange, yellow, red} from "@mui/material/colors";

interface StatusProps {
  [key: number]: {
    nameAr: string;
    color: string;
  };
}

// color: "#4DABF5",
const normal_cycle: StatusProps = {
  1: {
    nameAr: "طلب جديد",
    color: deepPurple["400"],
  },
  2: {
    nameAr: "طلب جديد pickup",
    color: "#7d749e",
  },
  3: {
    nameAr: "يتم جلبها للفرع",
    color: blue[400],
  },
  4: {
    nameAr: "في الفرع للتوصيل",
    color: grey["A700"],
  },
  5: {
    nameAr: "قيد التوصيل",
    color: blue["500"],
  },
  6: {
    nameAr: "في الفرع للاستلام",
    color: lightGreen["A200"],
  },
  7: {
    nameAr: "قيد التوصيل للاستلام",
    color: blue[400],
  },
  8: {
    nameAr: "تم التوصيل",
    color: green["A400"],
  },
  9: {
    nameAr: "تمت محاسبة السائق",
    color: grey["A400"],
  },
};

const commercial_cycle: StatusProps = {
  10: {
    nameAr: "المبلغ قيد التوصيل",
    color: blue[400],
  },
  11: {
    nameAr: "المبلغ في الفرع",
    color: grey["A400"],
  },
  12: {
    nameAr: "المبلغ جاهز للاستلام",
    color: lightGreen["A200"],
  },
  13: {
    nameAr: "تم استلام المبلغ",
    color: green["A400"],
  },
};

const retrieve_cycle: StatusProps = {
  14: {
    nameAr: "طلب ارجاع",
    color: orange["A400"],
  },
  15: {
    nameAr: "في الفرع للارجاع",
    color: orange["A400"],
  },
  16: {
    nameAr: "قيد الارجاع للفرع",
    color: orange["A400"],
  },
  17: {
    nameAr: "يتم الارجاع للعميل",
    color: orange["A400"],
  },
  18: {
    nameAr: "تم الارجاع",
    color: orange["A400"],
  },
};

const exchange_cycle: StatusProps = {
  19: {
    nameAr: "طلب استبدال",
    color: yellow["700"],
  },
  20: {
    nameAr: "في الفرع للاستبدال",
    color: yellow["700"],
  },
  21: {
    nameAr: "قيد الاستبدال للفرع",
    color: yellow["700"],
  },
  22: {
    nameAr: "يتم الاستبدال للمستلم",
    color: yellow["700"],
  },
  23: {
    nameAr: "تم الاستبدال",
    color: yellow["700"],
  },
};

const abort_cycle: StatusProps = {
  24: {
    nameAr: "طلب الغاء",
    color: deepOrange["A400"],
  },
  25: {
    nameAr: "تم الالغاء",
    color: deepOrange["A400"],
  },
};

const postpone_cycle: StatusProps = {
  26: {
    nameAr: "طلب تأجيل",
    color: yellow["800"],
  },
  27: {
    nameAr: "تم التأجيل",
    color: yellow["800"],
  },
};

const traking_status: StatusProps = {
  0: {
    nameAr: "مسودة",
    color: "#5f9ea0",
  },
  ...normal_cycle,
  ...commercial_cycle,
  ...retrieve_cycle,
  ...exchange_cycle,
  ...abort_cycle,
  ...postpone_cycle,
  28: {
    nameAr: "فشل التوصيل",
    color: red[500],
  },
  29: {
    nameAr: "في الفرع فشل توصيلها",
    color: red[600],
  },
  30: {
    nameAr: "قيد التوصيل 2",
    color: blue["500"],
  },
  31: {
    nameAr: "فشل التوصيل 2",
    color: red[500],
  },
  32: {
    nameAr: "في الفرع فشل توصيلها 2",
    color: red[600],
  },
  33: {
    nameAr: "قيد التوصيل 3",
    color: blue["500"],
  },
  34: {
    nameAr: "فشل التوصيل 3",
    color: red[500],
  }
};

export default traking_status;
export {
  normal_cycle,
  commercial_cycle,
  retrieve_cycle,
  exchange_cycle,
  abort_cycle,
  postpone_cycle,
};