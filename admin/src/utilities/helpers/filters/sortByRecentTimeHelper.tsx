import React from "react";
import dayjs from "dayjs";

interface Props {
  data: object[];
  iteration: string;
}

const sortByRecentTime = (iteration: any, data: object[], dateFormat?: string) => {
  // let arr = iteration.split(".");
  var len = iteration.length;

  let newData = data?.slice()?.sort(function (a: any, b: any) {
    var i = 0;
    while (i < len) {
      a = a[iteration[i]];
      b = b[iteration[i]];
      i++;
    }

    let timeA = dayjs(a, dateFormat || "DD/MM/YYYY HH:mm:ss").valueOf();
    let timeB = dayjs(b, dateFormat || "DD/MM/YYYY HH:mm:ss").valueOf();

    if (timeA < timeB) {
      return 1;
    } else if (timeA > timeB) {
      return -1;
    } else {
      return 0;
    }
  });
  return newData;
};

export default sortByRecentTime;
