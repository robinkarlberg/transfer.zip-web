import { useRouteLoaderData } from "react-router-dom";
import GenericPage from "../../../components/dashboard/GenericPage";
import BIcon from "../../../components/BIcon";
import EmptySpace from "../../../components/elements/EmptySpace";
import Modal from "../../../components/elements/Modal";
import { useRef, useState } from "react";

export default function BrandingPage({ }) {

  const { brandingList } = useRouteLoaderData("dashboard")

  const [showNewBrandModal, setShowNewBrandModal] = useState(false)

  const iconInputRef = useRef(null)
  const coverPhotoInputRef = useRef(null)

  const [iconBlob, setIconBlob] = useState(null)
  const [coverPhotoBlob, setCoverPhotoBlob] = useState(null)

  const handleSubmit = async e => {

  }

  const handleNewBrandProfile = () => {
    setShowNewBrandModal(true)
  }

  const handleChooseIcon = () => {
    iconInputRef.current.click()
  }

  const handleChooseCoverPhoto = () => {
    coverPhotoInputRef.current.click()
  }

  const handleIconInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconBlob(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleCoverPhotoInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoBlob(reader.result);
      };
      reader.readAsDataURL(file);
    }

  }

  return (
    <GenericPage title={"Branding & Domains"}>
      <Modal show={showNewBrandModal} title={"New Brand Profile"} icon={"plus-lg"} size={"sm:max-w-xl"} buttons={[
        { title: "Create", form: "newBrandForm" },
        { title: "Cancel", onClick: () => setShowNewBrandModal(false) }
      ]}>
        <div className="w-full">
          <form onSubmit={handleSubmit} id="newBrandForm" className="grid grid-cols-5 gap-y-6 gap-x-2">
            <div className="col-span-full mt-1">
              {/* <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                Brand Icon
              </label> */}
              <div className="mt-2 flex items-center gap-x-3">
                {iconBlob ?
                  <div className="h-12 w-12 rounded-full overflow-clip flex items-center justify-center">
                    <img src={iconBlob} className="object-contain">
                    </img>
                  </div>
                  :
                  <BIcon aria-hidden="true" name={"buildings-fill"} center className="text-2xl h-12 w-12 text-white rounded-full bg-gray-300" />}
                <button
                  onClick={handleChooseIcon}
                  type="button"
                  className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Choose Icon
                </button>
                <input
                  onChange={handleIconInputChange}
                  ref={iconInputRef}
                  name="icon-upload"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  className="sr-only"
                />
              </div>
            </div>
            <div className="col-span-3">
              <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  placeholder={"Acme Corp"}
                  name="name"
                  type="text"
                  required={true}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                />
              </div>
            </div>
            <div className="col-span-full">
              <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                Cover photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                {
                  coverPhotoBlob ?
                    <div>
                      <button onClick={() => setCoverPhotoBlob(null)}><BIcon name={"x-lg"}/></button>
                      <img className="w-full" src={coverPhotoBlob}></img>
                    </div>
                    :
                    <div className="text-center">
                      <BIcon aria-hidden="true" name={"image"} className="text-2xl mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          onClick={handleChooseCoverPhoto}
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-light"
                        >
                          <span>Upload a file</span>
                          <input onChange={handleCoverPhotoInputChange} ref={coverPhotoInputRef} name="cover-upload" type="file" accept=".png, .jpg, .jpeg" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">PNG or JPG up to 10MB</p>
                    </div>
                }
              </div>
            </div>
          </form>
        </div>
      </Modal>
      {brandingList.length > 0 && <button onClick={handleNewBrandProfile} className="text-white py-1.5 px-2 pe-3 text-sm rounded-lg shadow-sm bg-primary hover:bg-primary-light"><BIcon name={"plus-lg"} /> New Brand Profile</button>}
      {brandingList.length == 0 && (
        <EmptySpace
          onClick={handleNewBrandProfile}
          title={"Boost Your Brand Identity"}
          subtitle={"Set up personalized branding and utilize your own domain for transfers."}
          buttonText={"Create Brand Profile"}
        />
      )}
    </GenericPage>
  )
}