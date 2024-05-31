import React from "react";
import dayjs from "dayjs";

interface Props {
  data: object[];
  iteration: string;
}

const searchHelper = (value: string, data: object[]) => {
  return data?.slice()?.filter(function (o: any) {
    return Object.keys(o)?.some(function (k) {
      return o?.[k]?.toString()?.toLowerCase()?.indexOf(value) != -1;
    });
  });
};

export default searchHelper;
