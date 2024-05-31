import React, { useEffect } from "react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import dayjs from "dayjs";

interface Props {
  shipmentDataList?: any;
  userData?: any;
}

const ExtractAllExcel = ({ shipmentDataList, userData }: Props) => {
    useEffect(() => {
        async function exportExcel() {
            /* load local template */
            const filePath: string = `/extract-template.xlsx`;
            const buffer = await fetch(filePath).then((res) => res.arrayBuffer());
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.getWorksheet(1);
            /* insert today's date */
            worksheet.getCell("I5").value = dayjs().format("DD-MM-YYYY");

            /* add company info */
            let companyInfo = userData?.person?.company;

            console.log("companyInfo ", companyInfo)
            worksheet.getCell("B4").value = companyInfo?.name;
            worksheet.getCell("B5").value = companyInfo?.email;
            worksheet.getCell("B6").value = companyInfo?.phone01;

            /* create Table */
            const rows = shipmentDataList?.map((shipment: any, i: number) => {
                  return [
                      shipment?.price_delivery,
                      shipment?.price_box,
                      algerian_provinces[shipment?.recipient_city - 1]?.wilaya_name + ", " + shipment?.recipient_address,
                      shipment?.recipient_phone1,
                      shipment?.recipient_name,
                      shipment?.client?.person?.first_name + " " + shipment?.client?.person?.last_name,
                      shipment?.code_box,
                      i + 1,
                  ];
            });

            const table = worksheet.addTable({
                displayName: "Table",
                columns: [
                    {
                        name: "سعر التوصيل",
                        totalsRowLabel: "Total",
                        filterButton: false,
                    },
                    {
                        name: " سعر الطرد",
                        filterButton: false,
                    },
                    {
                        name: "الوجهة",
                        filterButton: false,
                    },
                    {
                        name: "رقم المستلم",
                        filterButton: false,
                    },
                    {
                        name: " إسم المستلم",
                        filterButton: false,
                    },
                    {
                        name: " إسم المرسل",
                        filterButton: false,
                    },
                    {
                        name: " كود الطرد",
                        filterButton: false,
                    },
                    {
                        name: "#",
                        totalsRowFunction: "sum",
                        filterButton: false,
                    },
                ],
                name: "MyTable",
                ref: "B8",
                headerRow: true,
                totalsRow: false,
                style: {
                    theme: "TableStyleMedium13",
                    showFirstColumn: false,
                    showLastColumn: false,
                    showRowStripes: true,
                    showColumnStripes: false,
                },
                rows: rows,
            });
            await table.commit();

            workbook.xlsx.writeBuffer()
            .then(async function (buffer) {
                // done
                console.log(buffer);

                const blob = new Blob([buffer], { type: "applicationi/xlsx" });
                await saveAs(blob, `receipt - ${dayjs().format("DD-MM-YYYY")}.xlsx`);
            })
            .then(() => {
                //return setTimeout(() => window.close(), 1500);
            });
        }

        if (shipmentDataList) exportExcel();

    }, [shipmentDataList]);

    return <></>;
};

export default ExtractAllExcel;
