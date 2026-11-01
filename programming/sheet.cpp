#include<bits/stdc++.h>
using namespace std;
int main(){
  int n;
  
  cin>>n;
  
  // Dynamically allocate memory
  int* arr=new int[n];
  
  for(int i=0;i<n;i++){
   cin >> arr[i];
   
  }
  
  for(int i=0;i<n;i++){
    cout<< arr[i];
  }
  
   // Free the allocated memory
  delete[]arr;
  
  return 0;
}