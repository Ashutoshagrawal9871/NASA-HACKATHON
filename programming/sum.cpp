#include<iostream>
using namespace std;

int solve(int &n){
    if(n < 1)  return 0; 
  int sum= n + solve(n - 1); 
    return sum;
}
int main(){
    int n ;cin>>n;
    cout << solve(n);
}

