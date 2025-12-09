import { useAxios } from "../axios/instances/axiosInstances";


export const useRazorpayService = () => {
    const { axiosOwnerInstance } = useAxios();

    return {

        getRazorpayKey: async () => {
            const response = await axiosOwnerInstance.get('/payments/razorpay-key');
            return response.data;
        },
    };

}    