import { Alert, Button, TextInput, Modal } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaSignOutAlt, FaEye, FaEyeSlash } from 'react-icons/fa'
import {
  getDownloadURL,
  getStorage,
  uploadBytesResumable,
  ref,
} from 'firebase/storage'
import { app,auth } from '../firebase'
import { signOut } from 'firebase/auth';
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import {
  updateStart,
  updateSuccess,
  updateFailure,
  signoutSuccess,
} from '../redux/user/userSlice'
import { HiOutlineExclamationCircle } from 'react-icons/hi'

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user)
  const [imageFile, setImageFile] = useState(null)
  const [imageFileURL, setImageFileURL] = useState(null)
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null)
  const [imageFileUploadError, setImageFileUploadError] = useState(null)
  const [imageFileUploading, setImageFileUploading] = useState(false)
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null)
  const [updateUserError, setUpdateUserError] = useState(null)
  const [showSignoutModal, setShowSignoutModal] = useState(false)

  const [formData, setFormData] = useState({
    firstname: currentUser?.firstName || '',
    middlename: currentUser?.middleName || '',
    lastname: currentUser?.lastName || '',
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const filePickerRef = useRef()
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setImageFileURL(URL.createObjectURL(file))
      setImageFileUploadError(null) // Clear any previous errors
    } else if (file) {
      setImageFileUploadError('Please select an image file.') // Set an error message
      setImageFile(null)
      setImageFileURL(null)
    }
  }
  useEffect(() => {
    console.log('Current user data:', currentUser)
  }, [currentUser])

  useEffect(() => {
    if (imageFile) {
      uploadImage(imageFile) // Pass the imageFile to the function
    }
  }, [imageFile])

  const uploadImage = async (imageFile) => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
  
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        console.error(error);
        setImageFileUploadError('Could not upload image (max size 2MB)');
        setImageFileUploadProgress(null); // Ensures the progress bar is hidden on error
        setImageFile(null); // Clears the current file state
        setImageFileURL(currentUser.profilePicture); // Reverts the image URL to the original profile picture
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Update the profile picture URL in the state
          setImageFileURL(downloadURL);
          setImageFileUploadProgress(null); // Also hide progress bar after successful upload
          setFormData({ ...formData, profilePicture: downloadURL });
  
          // Make the PATCH request to update the user's profile picture
          const response = await fetch(`/api/users/${currentUser.id}/profile-picture?profilePictureUrl=${encodeURIComponent(downloadURL)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              // Include authentication headers if needed
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to update user profile');
          }
          setImageFileURL(currentUser.profilePicture);
          setImageFileUploading(false);
        } catch (error) {
          console.error(error);
          setImageFileUploadError('Failed to update user profile');
          setImageFileUploadProgress(null); // Hide progress bar on error
          setImageFile(null); // Clear the file state
          setImageFileURL(currentUser.profilePicture); // Revert the image URL to the original
        }
      }
    );
  };
  
  

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  useEffect(() => {
    console.log('Form data:', formData)
  }, [formData])


  const handleSignout = async () => {
    try {
      // Sign out the user
      await signOut(auth);
      
      // Redirect to the login page
      dispatch(signoutSuccess());
      window.location.href = '/sign-in'; // Or another appropriate page
  
    } catch (error) {
      console.error("Sign out failed:", error.message);
      setUpdateUserError("Sign out failed: " + error.message);
      setShowSignoutModal(false); // Close the modal on error as well
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form  className="flex flex-col gap-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
              }}
            />
          )}
          <img
            src={imageFileURL || currentUser.profilePicture}
            alt="profile picture"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              'opacity-60'
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap -mx-2">
            <div className="w-1/2 px-2">
              <label htmlFor="firstname" className="font-medium">
                First Name
              </label>
              <TextInput
                id="firstname"
                type="text"
                placeholder="First Name"
                value={formData.firstname}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className="w-1/2 px-2">
              <label htmlFor="middlename" className="font-medium">
                Middle Name
              </label>
              <TextInput
                id="middlename"
                type="text"
                placeholder="Middle Name"
                value={formData.middlename}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-2">
            <div className="w-1/2 px-2">
              <label htmlFor="lastname" className="font-medium">
                Last Name
              </label>
              <TextInput
                id="lastname"
                type="text"
                placeholder="Last Name"
                value={formData.lastname}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className="w-1/2 px-2">
              <label htmlFor="username" className="font-medium">
                Username
              </label>
              <TextInput
                id="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-medium">
            Email
          </label>
          <TextInput
            id="email"
            type="text"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="department" className="font-medium">
            Department
          </label>
          <TextInput
            id="department"
            type="text"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            disabled
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-medium">
            Password
          </label>
          <div className="relative">
            <TextInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled
            />
            <div className="absolute inset-y-0 right-3 flex items-center text-sm leading-5">
              <button type="button" onClick={togglePasswordVisibility} disabled>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>
        {/* <Button
          type="submit"
          gradientDuoTone="redToYellow"
          outline
          disabled={loading || imageFileUploading}
        >
          {loading ? 'Loading...' : 'Update'}
        </Button> */}
      </form>

      <div className="text-red-500 flex justify-end mt-5 ">
        <button
          onClick={() => setShowSignoutModal(true)}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          Sign Out
          <FaSignOutAlt style={{ fontSize: '12px', marginLeft: '8px' }} />
        </button>
      </div>
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}

      <Modal
        show={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg font-semibold text-gray-500 dark:text-gray-400">
              Are you sure you want to sign out?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleSignout}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowSignoutModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
