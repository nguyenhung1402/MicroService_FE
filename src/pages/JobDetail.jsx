/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { CustomButton, JobCard, Loading, TextInput } from "../components";
import { apiRequest, handleFileUpload } from "../utils";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";

const noLogo =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/450px-No_image_available.svg.png";
const ApplyForm = ({ open, setOpen }) => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.user);

  const [job, setJob] = useState(null);

  const [uploadCv, setUploadCv] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState({ staus: false, message: "" });
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...user },
  });

  const onSubmit = async (data) => {
    console.log(data);
    setIsLoading(true);
    setErrMsg(null);
    const uri = uploadCv && (await handleFileUpload(uploadCv));

    const newData = uri ? { ...data, profileUrl: uri } : data;

    try {
      const res = await apiRequest({
        // url: "/jobs/apply-job/" + id,
        url: "http://posts.com:8801/api-v1/jobs/apply-job/" + id,
        token: user?.token,
        data: newData,
        method: "POST",
      });
      setIsLoading(false);

      if (res.status === "failed") {
        setErrMsg({ ...res });
      } else {
        setErrMsg({ status: "success", message: res.message });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const closeModal = () => setOpen(false);

  return (
    <>
      <Transition appear show={open ?? false} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Apply Job
                  </Dialog.Title>

                  <form
                    className="w-full mt-2 flex flex-col gap-5"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <TextInput
                      name="name"
                      label="Your Name"
                      type="text"
                      register={register("name", {
                        required: "Your name is required",
                      })}
                      error={errors.name ? errors.name?.message : ""}
                    />

                    <TextInput
                      name="email"
                      label="Email address"
                      placeholder="eg. abc@gmail.com"
                      type="text"
                      register={register("email", {
                        required: "Email is required",
                      })}
                      error={errors.email ? errors.email?.message : ""}
                    />

                    <div className="w-full flex gap-2">
                      <div className="w-1/2">
                        <TextInput
                          name="contact"
                          label="Contact"
                          placeholder="Phone Number"
                          type="text"
                          register={register("contact", {
                            required: "Contact is required!",
                          })}
                          error={errors.contact ? errors.contact?.message : ""}
                        />
                      </div>

                      <div className="w-1/2 mt-2">
                        <label className="text-gray-600 text-sm mb-1">
                          Upload CV
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setUploadCv(e.target.files[0])}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-gray-600 text-sm mb-1">
                        About Yourself
                      </label>
                      <textarea
                        className="ounded border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base px-4 py-2 resize-none"
                        rows={4}
                        cols={6}
                        {...register("about", {
                          required: "Write a little bit about your company.",
                        })}
                        aria-invalid={errors.about ? "true" : "false"}
                      ></textarea>
                      {errors.about && (
                        <span
                          role="alert"
                          className="text-xs text-red-500 mt-0.5"
                        >
                          {errors.about?.message}
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <CustomButton
                          type="submit"
                          containerStyles="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-8 py-2 text-sm font-medium text-white hover:bg-[#1d4fd846] hover:text-[#1d4fd8] focus:outline-none "
                          title={"Submit"}
                        />
                      )}
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
const JobDetail = () => {
  const { id } = useParams();

  const { user } = useSelector((state) => state.user);

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);

  const [selected, setSelected] = useState("0");
  const [isFetching, setIsFetching] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [errMsg, setErrMsg] = useState({ staus: false, message: "" });

  const getJobDetails = async () => {
    setIsFetching(true);

    try {
      const res = await apiRequest({
        // url: "/jobs/get-job-detail/" + id,
        url: "http://posts.com/job/api-v1/jobs/get-job-detail/" + id,
        method: "GET",
      });

      setJob(res?.data);
      console.log(res);
      setSimilarJobs(res?.similarJobs);
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      console.log(error);
    }
  };
  const handleDeletePost = async () => {
    setIsFetching(true);
    
    try {
      if (window.confirm("Delete Job Post?")) {
        const res = await apiRequest({
          // url: "/jobs/delete-job/" + job?._id,
          url: "http://posts.com/job/api-v1/jobs/delete-job/" + job?._id,
          token: user?.token,
          method: "DELETE",
        });

        if (res?.success) {
          alert(res?.messsage);
          window.location.replace("/");
        }
      }
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      console.log(error);
    }
  };

  useEffect(() => {
    id && getJobDetails();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [id]);
  console.log(job);
  return (
    <div className="container mx-auto">
      <div className="w-full flex flex-col md:flex-row gap-10">
        {/* LEFT SIDE */}
        {isFetching ? (
          <Loading />
        ) : (
          <div className="w-full h-fit md:w-2/3 2xl:2/4 bg-white px-5 py-10 md:px-10 shadow-md">
            <div className="w-full flex items-center justify-between">
              <div className="w-3/4 flex gap-2">
                <img
                  src={job?.company?.profileUrl || noLogo}
                  alt={job?.company?.name}
                  className="w-20 h-20 md:w-24 md:h-20 rounded"
                />

                <div className="flex flex-col">
                  <p className="text-xl font-semibold text-gray-600">
                    {job?.jobTitle}
                  </p>

                  <span className="text-base">{job?.location}</span>

                  <span className="text-base text-blue-600">
                    {job?.company?.name}
                  </span>

                  <span className="text-gray-500 text-sm">
                    {moment(job?.createdAt).fromNow()}
                  </span>
                </div>
              </div>

              <div className="">
                <AiOutlineSafetyCertificate className="text-3xl text-blue-500" />
              </div>
            </div>

            <div className="w-full flex flex-wrap md:flex-row gap-2 items-center justify-between my-10">
              <div className="bg-[#bdf4c8] w-40 h-16 rounded-lg flex flex-col items-center justify-center">
                <span className="text-sm">Salary</span>
                <p className="text-lg font-semibold text-gray-700">
                  $ {job?.salary}
                </p>
              </div>

              <div className="bg-[#bae5f4] w-40 h-16 rounded-lg flex flex-col items-center justify-center">
                <span className="text-sm">Job Type</span>
                <p className="text-lg font-semibold text-gray-700">
                  {job?.jobType}
                </p>
              </div>

              <div className="bg-[#fed0ab] w-40 h-16 px-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-sm">No. of Applicants</span>
                <p className="text-lg font-semibold text-gray-700">
                  {job?.application?.length}
                </p>
              </div>

              <div className="bg-[#cecdff] w-40 h-16 px-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-sm">No. of Vacancies</span>
                <p className="text-lg font-semibold text-gray-700">
                  {job?.vacancies}
                </p>
              </div>

              <div className="bg-[#ffcddf] w-40 h-16 px-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-sm">Yr. of Experience</span>
                <p className="text-lg font-semibold text-gray-700">
                  {job?.experience}
                </p>
              </div>
            </div>

            <div className="w-full flex gap-4 py-5">
              <CustomButton
                onClick={() => setSelected("0")}
                title="Job Description"
                containerStyles={`w-full flex items-center justify-center py-3 px-5 outline-none rounded-full text-sm ${
                  selected === "0"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300"
                }`}
              />

              <CustomButton
                onClick={() => setSelected("1")}
                title="Company"
                containerStyles={`w-full flex items-center justify-center  py-3 px-5 outline-none rounded-full text-sm ${
                  selected === "1"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300"
                }`}
              />
            </div>

            <div className="my-6">
              {selected === "0" ? (
                <>
                  <p className="text-xl font-semibold">Job Decsription</p>

                  <span className="text-base">{job?.detail[0]?.desc}</span>

                  {job?.detail[0]?.requirements && (
                    <>
                      <p className="text-xl font-semibold mt-8">Requirement</p>
                      <span className="text-base">
                        {job?.detail[0]?.requirements}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-6 flex flex-col">
                    <p className="text-xl text-blue-600 font-semibold">
                      {job?.company?.name}
                    </p>
                    <span className="text-base">{job?.company?.location}</span>
                    <span className="text-sm">{job?.company?.email}</span>
                  </div>

                  <p className="text-xl font-semibold">About Company</p>
                  <span>{job?.company?.about}</span>
                </>
              )}
            </div>

            <div className="w-full">
              {user?._id === job?.company?._id ? (
                <CustomButton
                  title="Delete Post"
                  onClick={handleDeletePost}
                  containerStyles={`w-full flex items-center justify-center text-white bg-red-700 py-3 px-5 outline-none rounded-full text-base`}
                />
              ) : (
                <CustomButton
                  title="Apply Now"
                  // onClick={() => setOpenForm(true)}
                  containerStyles={`w-full flex items-center justify-center text-white bg-black py-3 px-5 outline-none rounded-full text-base`}
                />
              )}
            </div>
            <ApplyForm open={openForm} setOpen={setOpenForm} />
          </div>
        )}

        {/* RIGHT SIDE */}
        {/* <div className="w-full md:w-1/3 2xl:w-2/4 p-5 mt-20 md:mt-0">
          <p className="text-gray-500 font-semibold">Similar Job Post</p>

          <div className="w-full flex flex-wrap gap-4">
            {similarJobs?.slice(0, 6).map((job, index) => {
              const data = {
                name: job?.company.name,
                logo: job?.company.profileUrl,
                ...job,
              };
              return <JobCard job={data} key={index} />;
            })}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default JobDetail;
