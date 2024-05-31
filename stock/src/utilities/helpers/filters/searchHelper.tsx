import React from "react";

interface Props {
  data: object[];
  iteration: string;
}

const searchHelper = (value: string, data: object[]) => {
    return data.slice().filter(function (o: any) {
        return Object.keys(o).some(function (k) {
            return o[k].toLowerCase().indexOf(value.toLowerCase()) != -1;
        });
    });
};

export default searchHelper;
