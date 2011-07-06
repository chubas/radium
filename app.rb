require 'rubygems'
require 'sinatra'

get '/a' do
  sleep(rand(6))
  
end