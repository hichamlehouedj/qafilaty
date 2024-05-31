import {AutocompleteProps, TextField, Autocomplete, Stack, Typography} from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import * as React from "react";
import {default as RAvatar} from "react-avatar";
import {useGetAllClients} from "../../graphql/hooks/clients";
import useStore from "../../store/useStore";
import { matchSorter } from 'match-sorter';
import { VariableSizeList, ListChildComponentProps } from "react-window";

interface CountryType {
    id: string;
    person: {
        first_name: string;
        last_name: string;
        email: string;
        phone01: string;
    }
}

export interface Props {
    onChangeCallback?: (data: string) => any;
    customInputProps?: {
        [key: string]: any;
    };
    value?: any;
}

const StyledAutocompleteSelect = styled(Autocomplete)(({ theme, color }: { theme: any; color?: any }) => {
    return {
        ...theme.typography["sm"],
        color: grey[800],

        "&.MuiAutocomplete-root": {
            height: "42px",
            background: "#fff"
        },

        [`&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline`]: {
            borderColor: grey[700],
            borderWidth: 2
        },

        [`& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline`]: {
            borderColor: theme.palette[color || "primary"].main
        },

        "& .MuiOutlinedInput-input.MuiInputBase-input": {
            height: "23px",
            padding: "0 5px !important",
            background: "#FFF",
            borderWidth: 1
        },

        [`& .MuiOutlinedInput-notchedOutline`]: { borderWidth: 1 },
        [`& .Mui-error .MuiOutlinedInput-notchedOutline`]: { borderWidth: 2 },

    };
});

const OuterElementContext = React.createContext({});

const OuterElementType = ((props: any) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div {...props} {...outerProps} />;
});

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];

    return (
        <Stack  key={dataSet[1].id} component="li" direction={"row"} columnGap={"5px"} alignItems="center" style={{marginBlockEnd: (data.length - 1) == index ? "0px" : "10px"}} {...dataSet[0]} >
            <RAvatar size="25px" name={dataSet[1]?.person?.first_name + " " + dataSet[1]?.person?.last_name} round style={{fontFamily: "Montserrat-Arabic", marginInlineStart: "-5px"}} maxInitials={1}></RAvatar>
            <Stack rowGap={"2px"}>
                <Typography variant="xs" color={grey[700]}>{dataSet[1]?.person?.first_name + " " + dataSet[1]?.person?.last_name}</Typography>
                <Typography variant="2xs" color={grey[400]}>{dataSet[1]?.person?.phone01}</Typography>
            </Stack>
        </Stack>
    );
}

function useResetCache(data: any) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
        if (ref.current != null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}

const ListboxComponent = ((props: any) => {
    const { children, ...other } = props;
    const itemData: React.ReactChild[] = [];
    (children as React.ReactChild[]).forEach((item: React.ReactChild & { children?: React.ReactChild[] }) => {
            itemData.push(item);
            itemData.push(...(item.children || []));
    });

    const itemCount = itemData.length;
    const itemSize = 55;

    const getHeight = () => {
        if (itemCount > 10) {
            return 10 * itemSize;
        }
        return itemSize * itemCount;
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    direction="rtl"
                    itemData={itemData}
                    height={getHeight() + 16}
                    width="100%"
                    outerElementType={OuterElementType}
                    ref={gridRef}
                    innerElementType="ul"
                    itemSize={(index: number) => 15}
                    itemCount={itemCount}
                    style={{right: "-30px", width:"calc(100% + 20px)"}}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

const AutoCompleteSelect = (props: Props) => {
    let userData = useStore((state: any) => state.userData);
    const [allClients, setAllClients] = React.useState<CountryType[]>([
        {
            id: '',
            person: {
                first_name: "",
                email: "",
                phone01: "",
                last_name: ""
            }
        }
    ]);

    const [value, setValue] = React.useState<any>("");

    React.useEffect(() => {
        if (typeof props.onChangeCallback == "function") {
            props.onChangeCallback(value);
        }
    }, [value]);

    // get all Clients
    let [getClientsData] = useGetAllClients({
        stock_id: userData?.person?.list_stock_accesses?.stock?.id,
    });

    React.useEffect(() => {
        setAllClients(() => [...getClientsData]);
    }, [getClientsData]);

    const filterOptions = (options: any, { inputValue } : any) => {
        //return matchSorter(options, inputValue, {keys: ['person.first_name', 'person.last_name', 'person.phone01']})

        let fullName = inputValue.split(" ");
        return fullName.reduceRight(
            (items: any, word: any) =>
                matchSorter(items, word, {
                    keys: ["person.first_name", "person.last_name", "person.phone01"]
                }),
            options
        );
    }

    return (
        <>
            <StyledAutocompleteSelect
                {...(props as any)}
                clearOnBlur
                handleHomeEndKeys
                id="list-clients"
                freeSolo

                value={props.value}

                ListboxComponent={ListboxComponent}

                options={allClients}

                getOptionLabel={(option: any) => {
                    return `${option?.person?.first_name} ${option?.person?.last_name}`;
                }}

                onChange={(event: any, newValue: any) => {
                    if (newValue) {
                        setValue(newValue)
                    }
                }}

                filterOptions={filterOptions}

                renderOption={(props, option) => [props, option]}

                renderInput={(params) => (
                    <TextField
                        {...params}
                        {...props?.customInputProps}
                        {...props?.customInputProps?.register}
                        placeholder="إختار العميل"
                        inputProps={{...params.inputProps}}
                    />
                )}
            ></StyledAutocompleteSelect>
        </>
    );
};

export default AutoCompleteSelect;