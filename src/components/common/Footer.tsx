import React from 'react';
import { Brain, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-xl font-semibold text-gray-900">HMS</span>
            </div>
            <p className="text-gray-600 text-sm">
              Advanced brain activity monitoring and analysis for improved patient care.
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Resources
            </h3>
            <div className="flex flex-col space-y-2">
              <a href="https://github.com/MK-DEV369/HMS_Brain" className="text-gray-600 hover:text-gray-900">Documentation</a>
              <a href="https://drive.google.com/drive/folders/1E0fTAo76CXUsU3bN_hMsLKdB6DdyDwAC?usp=sharing" className="text-gray-600 hover:text-gray-900">Research Papers</a>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Contact
            </h3>
            <div className="flex flex-col space-y-2">
              {/* <a href="mailto:lmoryakantha.ai24@rvce.edu.in" className="flex items-center text-gray-600 hover:text-gray-900">
                <Mail className="h-4 w-4 mr-2" />
                L Moryakantha
              </a> */}
              <a href="https://github.com/MK-DEV369/HMS_Brain" className="flex items-center text-gray-600 hover:text-gray-900">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} HMS Brain Activity Monitor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;