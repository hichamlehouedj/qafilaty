import { Grid } from "@mui/material";
import React, {useState} from "react";
import { Check, Plus, X } from "react-feather";
import { useForm } from "react-hook-form";
import { useCreateUser as useCreateUserClient } from "../../graphql/hooks/clients";
import { useCreateUser as useCreateUserEmployee } from "../../graphql/hooks/employees";
import Button from "../Button";
import Input from "../Input/Input";
import Modal from "./Modal";
import { useSnackbar } from "notistack";
import {ALL_FACTORS} from "../../graphql/hooks/employees/useGetAllEmployees";
import {ALL_CLIENTS} from "../../graphql/hooks/clients/useGetAllClients";
import useStore from "../../store/useStore";

interface Props {
    personID: string;
    open: boolean;
    onClose?: () => void;
    typePerson?: string;
    role?: string;
}

const initialInputs = {
    username: "",
    password: ""
};

const AddUserModal = ({ open, onClose, personID, typePerson, role }: Props) => {
    let {register, handleSubmit, reset, setError, formState: { errors }} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    let [createUserClient] = useCreateUserClient();
    let [createUserEmployee] = useCreateUserEmployee();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    let onFormSubmit = ({username, password}: any) => {
        setSubmitLoading(true);
        let create = null;
        if (typePerson == "client") {
            create = createUserClient({
                variables: {
                    content: {
                        user_name: username,
                        password: password,
                        role: "Client",
                        id_person: personID
                    }
                },
                update: (cache, { data: { createUser } }) => {

                    let cacheData: object | null = {}

                    cacheData = cache.readQuery({
                        query: ALL_CLIENTS,
                        variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id }
                    });

                    let findIndex: any
                    if (typeof cacheData === 'object' && cacheData !== null && 'allClients' in cacheData) {
                        // @ts-ignore
                        findIndex = cacheData?.allClients?.findIndex(
                            ({person}: any) => person.id === personID
                        );
                    }

                    let updatedData = {
                        user_name: username,
                        id: "",
                        activation:"desactive",
                        lastConnection: "",
                        lastDisconnection: ""
                    }

                    // @ts-ignore
                    let newData = [...cacheData?.allClients];

                    newData[findIndex] = {...newData[findIndex], user: updatedData}

                    cache.writeQuery({
                        query: ALL_CLIENTS,
                        variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id },
                        data: {
                            allClients: newData,
                        },
                    });
                }
            })
        } else {
            create = createUserEmployee({
                variables: {
                    content: {
                        user_name: username,
                        password: password,
                        role: role,
                        id_person: personID
                    }
                },
                update: (cache, { data: { createUser } }) => {

                    let cacheData: object | null = {}

                    cacheData = cache.readQuery({
                        query: ALL_FACTORS,
                        variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id }
                    });

                    let findIndex: any
                    if (typeof cacheData === 'object' && cacheData !== null && 'allFactors' in cacheData) {
                        // @ts-ignore
                        findIndex = cacheData?.allFactors?.findIndex(
                            ({person}: any) => person.id === personID
                        );
                    }

                    let updatedData = {
                        user_name: username,
                        id: "",
                        activation:"desactive",
                        lastConnection: "",
                        lastDisconnection: ""
                    }

                    // @ts-ignore
                    let newData = [...cacheData?.allFactors];

                    newData[findIndex] = {...newData[findIndex], user: updatedData}

                    cache.writeQuery({
                        query: ALL_FACTORS,
                        variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id },
                        data: {
                            allFactors: newData,
                        },
                    });
                }
            })
        }

        create.then(() => {
            enqueueSnackbar("لقد تمت إضافة الحساب بنجاح", {variant: "success"});
            closeHandler();
        }).catch(({graphQLErrors}) => {
            if (graphQLErrors[0]?.extensions.code === "USERNAME_ALREADY_EXIST") {
                setError("username", {
                    type: "manual",
                    message: "اسم المستخدم هذا موجود سابقا",
                })
            } else if (graphQLErrors[0]?.extensions.code === "ALREADY_HAS_ACCOUNT") {

            } else if (graphQLErrors[0]?.extensions.code === "PERSON_NOT_EXIST") {

            }
        });
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        reset(initialInputs);
        typeof onClose == "function" && onClose();
        setSubmitLoading(false);
    };

    return (
        <Modal open={open} onClose={closeHandler} title="إضافة حساب" iconTitle={<Plus/>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Input helperText={errors?.username?.message} error={errors?.username} placeholder="اسم المستخدم" fullWidth {...register("username", { required: true })} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input type={"password"} error={errors?.password} placeholder="كلمة المرور" fullWidth {...register("password", { required: true })} ></Input>
                    </Grid>

                </Grid>
            </form>
        </Modal>
    );
};

export default AddUserModal;
