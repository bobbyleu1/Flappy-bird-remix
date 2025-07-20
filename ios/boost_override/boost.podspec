require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "boost"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = package["description"]
  s.homepage     = "https://github.com/react-native-community/boost-for-react-native"
  s.license      = package["license"]
  s.author       = { "Facebook" => "opensource@fb.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/react-native-community/boost-for-react-native.git", :tag => "v1.63.0" }
  s.source_files = "**/*.{h,hpp}"
  s.header_mappings_dir = "."
end
