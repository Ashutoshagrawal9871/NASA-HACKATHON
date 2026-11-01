#include<iostream>
using namespace std ;
class car {
   public:
   string brand;
   string model;
   car(string x,string y );
   
   };
   car::car(string x,string y){
       brand=x;
       model=y;
   
   };
    int main(){
        car object1 ("BMW","xS");
        car object2 ("ford","Mustang");
       cout<<object1.brand<<" "<<object1.model<<" "<<endl;
        cout<<object2.brand<<" "<<object2.model<<" "<<endl;
        return 0;
    }