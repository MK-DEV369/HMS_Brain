import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Signin: React.FC = () => {
  return (
    <div className="flex justify-evenly transition-colors duration-700 min-h-screen items-center bg-gray-50">
      <div className="w-full max-w-4xl flex flex-row bg-white rounded-2xl shadow-2xl p-10 animate-fade-in transition-all duration-700">
        <div className="flex-grow pr-8">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-8 tracking-tight transition-colors duration-500">
            Doctor Authentication
          </h1>
          <ul className="space-y-6 text-lg">
            <li className="bg-blue-50 rounded-lg p-4 shadow-sm transition-transform duration-300 hover:scale-105">
              <span className="font-semibold text-blue-700">Secure & Accurate:</span> 
              Our application provides highly secure and accurate predictions for brain activity monitoring. Advanced machine learning models and real-time data analysis ensure precise detection of harmful brain activity patterns.
            </li>
            <li className="bg-blue-50 rounded-lg p-4 shadow-sm transition-transform duration-300 hover:scale-105">
              <span className="font-semibold text-blue-700">Confidentiality:</span> 
              All patient records and data processed by our system are strictly confidential. Robust security measures protect sensitive information and prevent unauthorized access.
            </li>
            <li className="bg-blue-50 rounded-lg p-4 shadow-sm transition-transform duration-300 hover:scale-105">
              <span className="font-semibold text-blue-700">Restricted Access:</span> 
              Access to patient records is limited to authorized medical professionals. Only qualified doctors can view and manage patient data.
            </li>
            <li className="bg-blue-50 rounded-lg p-4 shadow-sm transition-transform duration-300 hover:scale-105">
              <span className="font-semibold text-blue-700">Compliance:</span> 
              We comply with all relevant healthcare regulations and industry standards for data protection. Our commitment to patient privacy and security is unwavering.
            </li>
          </ul>
        </div>
        <div className="w-40" />
        <div className="hidden md:block w-[2px] bg-gray-200 mx-8" />
        <div className="flex items-center justify-center min-w-[340px]">
          <SignIn
            path="/signin"
            routing="path"
            signUpUrl="/signup"
            appearance={{
              elements: {
                card: "shadow-none bg-transparent",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Signin;