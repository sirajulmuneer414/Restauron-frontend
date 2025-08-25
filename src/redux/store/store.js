import {configureStore} from '@reduxjs/toolkit'
import signupOption from '../slice/signupOptionSlice'
import isLoadingSlice from '../slice/isLoadingSlice'
import specialPermissionsSlice from '../slice/specialPermissions'
import userSlice from '../slice/userSlice'
import specialValuesSlice from '../slice/specialValues'


export default configureStore({
    reducer: {
        // Add your reducers here
        signupOption: signupOption,
        isLoadingSlice: isLoadingSlice,
        specialPermissions: specialPermissionsSlice,
        userSlice: userSlice,
        specialValues: specialValuesSlice
    }
})